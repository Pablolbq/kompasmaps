import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getTextContent(parent: any, tagName: string): string {
  // Walk through all child nodes to find matching tag
  if (!parent || !parent.children) return '';
  for (const child of parent.children) {
    if (child.name === tagName) {
      return extractText(child);
    }
    // Search nested (the XML has weird nesting like transacao2 > finalidade2 > tipo2)
    const found = getTextContent(child, tagName);
    if (found) return found;
  }
  return '';
}

function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map((c: any) => extractText(c)).join('');
  return '';
}

function getPhotos(imovelNode: any): string[] {
  const photos: string[] = [];
  findPhotos(imovelNode, photos);
  return photos;
}

function findPhotos(node: any, photos: string[]) {
  if (!node || !node.children) return;
  if (node.name === 'foto') {
    for (const child of node.children) {
      if (child.name === 'url') {
        const url = extractText(child).trim();
        if (url) photos.push(url);
      }
    }
    return;
  }
  for (const child of node.children) {
    findPhotos(child, photos);
  }
}

// Simple XML parser for Deno (no external deps)
interface XmlNode {
  type: 'element' | 'text';
  name?: string;
  children?: XmlNode[];
  value?: string;
}

function parseXml(xml: string): XmlNode {
  // Remove XML declaration and CDATA markers
  xml = xml.replace(/<\?xml[^?]*\?>/g, '');
  
  const root: XmlNode = { type: 'element', name: 'root', children: [] };
  const stack: XmlNode[] = [root];
  let i = 0;

  while (i < xml.length) {
    if (xml[i] === '<') {
      // Check for CDATA
      if (xml.substring(i, i + 9) === '<![CDATA[') {
        const end = xml.indexOf(']]>', i);
        const text = end > -1 ? xml.substring(i + 9, end) : xml.substring(i + 9);
        stack[stack.length - 1].children!.push({ type: 'text', value: text });
        i = end > -1 ? end + 3 : xml.length;
        continue;
      }
      // Check for comment
      if (xml.substring(i, i + 4) === '<!--') {
        const end = xml.indexOf('-->', i);
        i = end > -1 ? end + 3 : xml.length;
        continue;
      }
      
      const end = xml.indexOf('>', i);
      if (end === -1) break;
      const tag = xml.substring(i + 1, end).trim();
      
      if (tag.startsWith('/')) {
        // Closing tag
        if (stack.length > 1) stack.pop();
      } else if (tag.endsWith('/')) {
        // Self-closing
        const name = tag.slice(0, -1).split(/\s/)[0];
        stack[stack.length - 1].children!.push({ type: 'element', name, children: [] });
      } else {
        const name = tag.split(/\s/)[0];
        const node: XmlNode = { type: 'element', name, children: [] };
        stack[stack.length - 1].children!.push(node);
        stack.push(node);
      }
      i = end + 1;
    } else {
      // Text node
      const nextTag = xml.indexOf('<', i);
      const text = nextTag > -1 ? xml.substring(i, nextTag) : xml.substring(i);
      const trimmed = text.trim();
      if (trimmed) {
        stack[stack.length - 1].children!.push({ type: 'text', value: trimmed });
      }
      i = nextTag > -1 ? nextTag : xml.length;
    }
  }

  return root;
}

function findAllByName(node: XmlNode, name: string): XmlNode[] {
  const results: XmlNode[] = [];
  if (node.name === name) results.push(node);
  if (node.children) {
    for (const child of node.children) {
      results.push(...findAllByName(child, name));
    }
  }
  return results;
}

function mapTypeToLocal(tipo: string): string {
  const lower = tipo.toLowerCase();
  if (lower.includes('apartamento')) return 'apartamento';
  if (lower.includes('casa') || lower.includes('sobrado')) return 'casa';
  if (lower.includes('terreno') || lower.includes('lote')) return 'terreno';
  if (lower.includes('comercial') || lower.includes('sala') || lower.includes('loja') || lower.includes('galpão') || lower.includes('galpao')) return 'comercial';
  return 'casa';
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlUrl } = await req.json();
    if (!xmlUrl) {
      return new Response(JSON.stringify({ error: 'xmlUrl is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Check user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch XML
    console.log('Fetching XML from:', xmlUrl);
    const xmlResponse = await fetch(xmlUrl);
    if (!xmlResponse.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch XML: ${xmlResponse.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const xmlText = await xmlResponse.text();
    console.log('XML length:', xmlText.length);

    // Parse XML
    const doc = parseXml(xmlText);
    const imoveis = findAllByName(doc, 'imovel');
    console.log('Found', imoveis.length, 'properties in XML');

    if (imoveis.length === 0) {
      return new Response(JSON.stringify({ error: 'No properties found in XML', imported: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const properties = [];
    const skipped = [];

    for (const imovel of imoveis) {
      try {
        const titulo = getTextContent(imovel, 'titulo');
        const tipo = getTextContent(imovel, 'tipo');
        const valor = parseFloat(getTextContent(imovel, 'valor')) || 0;
        const areaTotal = parseFloat(getTextContent(imovel, 'area_total')) || 0;
        const quartos = parseInt(getTextContent(imovel, 'quartos')) || 0;
        const banheiro = parseInt(getTextContent(imovel, 'banheiro')) || 0;
        const garagem = parseInt(getTextContent(imovel, 'garagem')) || 0;
        const endereco = getTextContent(imovel, 'endereco');
        const numero = getTextContent(imovel, 'numero');
        const bairro = getTextContent(imovel, 'bairro');
        const cep = getTextContent(imovel, 'cep');
        const lat = parseFloat(getTextContent(imovel, 'latitude'));
        const lng = parseFloat(getTextContent(imovel, 'longitude'));
        const descritivo = getTextContent(imovel, 'descritivo');
        const photos = getPhotos(imovel);

        if (!titulo || isNaN(lat) || isNaN(lng)) {
          skipped.push({ titulo: titulo || 'Unknown', reason: 'Missing title or coordinates' });
          continue;
        }

        const fullAddress = numero && numero !== '00' ? `${endereco}, ${numero}` : endereco;

        properties.push({
          title: titulo,
          type: mapTypeToLocal(tipo),
          price: valor,
          area: areaTotal,
          bedrooms: quartos || null,
          bathrooms: banheiro || null,
          garage_spaces: garagem || null,
          address: fullAddress,
          neighborhood: bairro,
          cep: cep,
          lat,
          lng,
          images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'],
          description: stripHtml(descritivo),
          archived: false,
        });
      } catch (e) {
        console.error('Error parsing imovel:', e);
        skipped.push({ titulo: 'Parse error', reason: String(e) });
      }
    }

    console.log('Parsed', properties.length, 'properties, skipped', skipped.length);

    // Insert in batches of 50
    let inserted = 0;
    const errors: string[] = [];
    for (let i = 0; i < properties.length; i += 50) {
      const batch = properties.slice(i, i + 50);
      const { error: insertError, data } = await adminClient
        .from('properties')
        .insert(batch)
        .select('id');

      if (insertError) {
        console.error('Insert error:', insertError);
        errors.push(insertError.message);
      } else {
        inserted += data?.length || 0;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: inserted,
      total: imoveis.length,
      skipped: skipped.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Import error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

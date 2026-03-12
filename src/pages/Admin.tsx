import { useState, useEffect } from 'react';
import { PropertyType, propertyTypeLabels, mapDbProperty, Property, MediaType, mediaTypeLabels, ListingType, listingTypeLabels } from '@/data/properties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/ImageUploader';
import { Plus, ArrowLeft, Lock, LogOut, Loader2, Pencil, Trash2, Archive, ArchiveRestore, Search, MapPin, Upload } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logoIcon from '@/assets/logo-icon.png';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const defaultForm = {
  title: '', type: 'casa' as PropertyType, price: '', area: '', bedrooms: '', bathrooms: '',
  garageSpaces: '', address: '', neighborhood: '', cep: '', lat: '', lng: '', description: '',
  mediaType: '' as string,
};

const DEFAULT_LAT = -25.0945;
const DEFAULT_LNG = -50.1633;

const pinIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#1a9a8a;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);border:3px solid white;"><span style="transform:rotate(45deg);font-size:14px;">📍</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={[lat, lng]} icon={pinIcon} />;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

// Geocode an address string using Nominatim
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

// Lookup address from CEP using ViaCEP
async function lookupCep(cep: string): Promise<{ address: string; neighborhood: string; city: string; state: string } | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      address: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch {}
  return null;
}

type DbProperty = Property & { archived: boolean };

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function Admin() {
  const { session, loading, isAdmin, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [properties, setProperties] = useState<DbProperty[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [form, setForm] = useState(defaultForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [xmlUrl, setXmlUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImportXml = async () => {
    if (!xmlUrl.trim()) { toast.error('Cole a URL do XML'); return; }
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-xml', {
        body: { xmlUrl: xmlUrl.trim() },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setImporting(false); return; }
      toast.success(`Importados ${data.imported} de ${data.total} imóveis! ${data.skipped > 0 ? `(${data.skipped} ignorados)` : ''}`);
      setShowImport(false);
      setXmlUrl('');
      fetchProperties();
    } catch (err: any) {
      toast.error('Erro na importação: ' + (err.message || 'Erro desconhecido'));
    }
    setImporting(false);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30";

  const fetchProperties = async () => {
    setListLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setProperties(data.map(r => ({ ...mapDbProperty(r), archived: r.archived })));
    }
    setListLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) toast.error('Email ou senha incorretos.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-card p-6 rounded-2xl border border-border shadow-lg">
           <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logoIcon} alt="Kompas" className="w-10 h-10 rounded-xl" />
          </div>
          <h1 className="text-lg font-bold text-foreground text-center">Área Administrativa</h1>
          <p className="text-xs text-muted-foreground text-center">Faça login para continuar</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loginLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {loginLoading ? <Loader2 size={16} className="animate-spin" /> : 'Entrar'}
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">← Voltar ao mapa</Link>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 bg-card p-6 rounded-2xl border border-border shadow-lg text-center">
          <h1 className="text-lg font-bold text-foreground">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">Sua conta não tem permissão de administrador.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={signOut} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">Sair</button>
            <Link to="/" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Voltar ao mapa</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form helpers ──
  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const openNewForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setImageUrls([]);
    setView('form');
  };

  const openEditForm = (p: DbProperty) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      type: p.type,
      price: String(p.price),
      area: String(p.area),
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
      garageSpaces: p.garageSpaces != null ? String(p.garageSpaces) : '',
      address: p.address,
      neighborhood: p.neighborhood,
      cep: (p as any).cep ?? '',
      lat: String(p.lat),
      lng: String(p.lng),
      description: p.description,
      mediaType: p.mediaType ?? '',
    });
    setImageUrls(p.images);
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.address || !form.neighborhood) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    const isMidia = form.type === 'midia';
    const payload = {
      title: form.title,
      type: form.type,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: !isMidia && form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: !isMidia && form.bathrooms ? Number(form.bathrooms) : null,
      garage_spaces: !isMidia && form.garageSpaces ? Number(form.garageSpaces) : null,
      address: form.address,
      neighborhood: form.neighborhood,
      cep: form.cep,
      lat: form.lat ? Number(form.lat) : DEFAULT_LAT,
      lng: form.lng ? Number(form.lng) : DEFAULT_LNG,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'],
      description: form.description,
      media_type: isMidia && form.mediaType ? form.mediaType : null,
    };

    const { error } = editingId
      ? await supabase.from('properties').update(payload).eq('id', editingId)
      : await supabase.from('properties').insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success(editingId ? 'Imóvel atualizado!' : 'Imóvel adicionado!');
    setView('list');
    fetchProperties();
  };

  const handleArchive = async (id: string, archived: boolean) => {
    const { error } = await supabase.from('properties').update({ archived: !archived }).eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success(archived ? 'Imóvel reativado!' : 'Imóvel arquivado!');
    fetchProperties();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Imóvel excluído!');
    fetchProperties();
  };

  // ── Filter properties ──
  const filtered = properties.filter(p => {
    if (filter === 'active' && p.archived) return false;
    if (filter === 'archived' && !p.archived) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Render ──
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {view === 'form' ? (
            <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
          ) : (
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={18} className="text-foreground" />
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="Kompas" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="font-semibold text-base text-foreground leading-tight tracking-tight">Admin</h1>
              <p className="text-[11px] text-muted-foreground">
                {view === 'form' ? (editingId ? 'Editar imóvel' : 'Novo imóvel') : 'Gerenciar imóveis'}
              </p>
            </div>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </header>

      {view === 'list' ? (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              {(['active', 'archived', 'all'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'active' ? 'Ativos' : f === 'archived' ? 'Arquivados' : 'Todos'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-44"
                />
              </div>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-all whitespace-nowrap"
              >
                <Upload size={14} /> Importar XML
              </button>
              <button
                onClick={openNewForm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                <Plus size={14} /> Novo
              </button>
            </div>
          </div>

          {/* Property list */}
          {listLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum imóvel encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    p.archived ? 'border-border/50 bg-muted/30 opacity-70' : 'border-border bg-card hover:shadow-sm'
                  }`}
                >
                  <img
                    src={p.images[0] || '/placeholder.svg'}
                    alt={p.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{p.title}</h3>
                      {p.archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Arquivado</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.neighborhood} — {p.address}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(p)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleArchive(p.id, p.archived)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title={p.archived ? 'Reativar' : 'Arquivar'}
                    >
                      {p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-2 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Property form ── */
        <div className="max-w-lg mx-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Título *</label>
              <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Casa no Jardim Carvalho" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo *</label>
              <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                {(['casa', 'apartamento', 'terreno', 'comercial', 'midia'] as PropertyType[]).map((t) => (
                  <option key={t} value={t}>{propertyTypeLabels[t]}</option>
                ))}
              </select>
            </div>

            {form.type === 'midia' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Mídia</label>
                <select className={inputClass} value={form.mediaType} onChange={(e) => set('mediaType', e.target.value)}>
                  <option value="">Selecione...</option>
                  {(['digital', 'estatica'] as MediaType[]).map((t) => (
                    <option key={t} value={t}>{mediaTypeLabels[t]}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Preço (R$) *</label>
                <input type="number" className={inputClass} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="350000" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Área (m²) *</label>
                <input type="number" className={inputClass} value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="120" />
              </div>
            </div>

            {form.type !== 'midia' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Quartos</label>
                  <input type="number" className={inputClass} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Banheiros</label>
                  <input type="number" className={inputClass} value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Vagas</label>
                  <input type="number" className={inputClass} value={form.garageSpaces} onChange={(e) => set('garageSpaces', e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">CEP</label>
              <input
                className={inputClass}
                value={form.cep}
                onChange={async (e) => {
                  const val = e.target.value;
                  set('cep', val);
                  const clean = val.replace(/\D/g, '');
                  if (clean.length === 8) {
                    const result = await lookupCep(clean);
                    if (result) {
                      setForm(prev => ({
                        ...prev,
                        address: result.address || prev.address,
                        neighborhood: result.neighborhood || prev.neighborhood,
                      }));
                      // Geocode the full address
                      const query = `${result.address}, ${result.neighborhood}, ${result.city}, ${result.state}, Brazil`;
                      const coords = await geocodeAddress(query);
                      if (coords) {
                        setForm(prev => ({ ...prev, lat: String(coords.lat), lng: String(coords.lng) }));
                      }
                      toast.success('Endereço preenchido pelo CEP!');
                    }
                  }
                }}
                placeholder="84015-000"
                maxLength={9}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Endereço *</label>
              <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua Santos Dumont, 450" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bairro *</label>
              <input className={inputClass} value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Jardim Carvalho" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Localização no Mapa <span className="text-muted-foreground/60">(clique para ajustar o pin)</span></label>
              <div className="h-48 rounded-lg overflow-hidden border border-border mt-1">
                <MapContainer
                  center={[form.lat ? Number(form.lat) : DEFAULT_LAT, form.lng ? Number(form.lng) : DEFAULT_LNG]}
                  zoom={14}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    lat={form.lat ? Number(form.lat) : DEFAULT_LAT}
                    lng={form.lng ? Number(form.lng) : DEFAULT_LNG}
                    onChange={(lat, lng) => {
                      set('lat', String(lat));
                      set('lng', String(lng));
                    }}
                  />
                  <RecenterMap
                    lat={form.lat ? Number(form.lat) : DEFAULT_LAT}
                    lng={form.lng ? Number(form.lng) : DEFAULT_LNG}
                  />
                </MapContainer>
              </div>
              {form.lat && form.lng && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  📍 {Number(form.lat).toFixed(6)}, {Number(form.lng).toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Fotos</label>
              <ImageUploader images={imageUrls} onChange={setImageUrls} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
              <textarea className={`${inputClass} min-h-[80px]`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Detalhes do imóvel..." />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingId ? 'Salvar alterações' : <><Plus size={16} /> Adicionar Imóvel</>}
            </button>
          </form>
        </div>
      )}

      {/* Import XML Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !importing && setShowImport(false)}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">Importar XML</h2>
            <p className="text-xs text-muted-foreground">Cole a URL do feed XML de imóveis para importar automaticamente.</p>
            <input
              className={inputClass}
              value={xmlUrl}
              onChange={(e) => setXmlUrl(e.target.value)}
              placeholder="https://exemplo.com.br/integracao/feed.xml"
              disabled={importing}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowImport(false)}
                disabled={importing}
                className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportXml}
                disabled={importing || !xmlUrl.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {importing ? <><Loader2 size={14} className="animate-spin" /> Importando...</> : <><Upload size={14} /> Importar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { PropertyType, propertyTypeLabels } from '@/data/properties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/ImageUploader';
import { MapPin, Plus, ArrowLeft, Lock, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const defaultForm = {
  title: '', type: 'casa' as PropertyType, price: '', area: '', bedrooms: '', bathrooms: '',
  garageSpaces: '', address: '', neighborhood: '', lat: '', lng: '', description: '',
};

export default function Admin() {
  const { session, loading, isAdmin, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) {
      toast.error('Email ou senha incorretos.');
    }
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
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Lock size={20} className="text-primary-foreground" />
            </div>
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
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
            ← Voltar ao mapa
          </Link>
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
            <button onClick={signOut} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
              Sair
            </button>
            <Link to="/" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              Voltar ao mapa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const addImageField = () => setImageUrls((prev) => [...prev, '']);
  const removeImageField = (index: number) => setImageUrls((prev) => prev.filter((_, i) => i !== index));
  const updateImageField = (index: number, value: string) => setImageUrls((prev) => prev.map((v, i) => i === index ? value : v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.address || !form.neighborhood || !form.lat || !form.lng) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    const validImages = imageUrls.map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('properties').insert({
      title: form.title,
      type: form.type,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      garage_spaces: form.garageSpaces ? Number(form.garageSpaces) : null,
      address: form.address,
      neighborhood: form.neighborhood,
      lat: Number(form.lat),
      lng: Number(form.lng),
      images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'],
      description: form.description,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Erro ao adicionar imóvel: ' + error.message);
      return;
    }
    toast.success('Imóvel adicionado com sucesso!');
    setForm(defaultForm);
    setImageUrls(['']);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base text-foreground leading-tight">Admin</h1>
              <p className="text-[11px] text-muted-foreground">Adicionar imóvel</p>
            </div>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div className="max-w-lg mx-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Título *</label>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Casa no Jardim Carvalho" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo *</label>
            <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
              {(['casa', 'apartamento', 'terreno', 'comercial'] as PropertyType[]).map((t) => (
                <option key={t} value={t}>{propertyTypeLabels[t]}</option>
              ))}
            </select>
          </div>

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

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Endereço *</label>
            <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua Santos Dumont, 450" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Bairro *</label>
            <input className={inputClass} value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Jardim Carvalho" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Latitude *</label>
              <input type="number" step="any" className={inputClass} value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="-25.0916" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Longitude *</label>
              <input type="number" step="any" className={inputClass} value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="-50.1570" />
            </div>
          </div>

          {/* Photo URLs */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Fotos</label>
            <div className="space-y-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={url}
                    onChange={(e) => updateImageField(i, e.target.value)}
                    placeholder={`URL da foto ${i + 1}`}
                  />
                  {imageUrls.length > 1 && (
                    <button type="button" onClick={() => removeImageField(i)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {imageUrls.some(u => u.trim()) && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {imageUrls.filter(u => u.trim()).map((url, i) => (
                    <img key={i} src={url.trim()} alt={`Preview ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ImagePlus size={14} /> Adicionar mais uma foto
              </button>
            </div>
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
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Adicionar Imóvel</>}
          </button>
        </form>
      </div>
    </div>
  );
}

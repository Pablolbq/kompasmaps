import { useState } from 'react';
import { addProperty, PropertyType, propertyTypeLabels } from '@/data/properties';
import { MapPin, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const defaultForm = {
  title: '', type: 'casa' as PropertyType, price: '', area: '', bedrooms: '', bathrooms: '',
  garageSpaces: '', address: '', neighborhood: '', lat: '', lng: '', image: '', description: '',
};

export default function Admin() {
  const [form, setForm] = useState(defaultForm);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.address || !form.neighborhood || !form.lat || !form.lng) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    addProperty({
      title: form.title,
      type: form.type,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      garageSpaces: form.garageSpaces ? Number(form.garageSpaces) : undefined,
      address: form.address,
      neighborhood: form.neighborhood,
      lat: Number(form.lat),
      lng: Number(form.lng),
      image: form.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      description: form.description,
    });
    toast.success('Imóvel adicionado com sucesso!');
    setForm(defaultForm);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
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

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">URL da Imagem</label>
            <input className={inputClass} value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
            <textarea className={`${inputClass} min-h-[80px]`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Detalhes do imóvel..." />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} /> Adicionar Imóvel
          </button>
        </form>
      </div>
    </div>
  );
}

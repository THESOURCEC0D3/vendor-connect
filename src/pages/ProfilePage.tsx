import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Store, MapPin, Phone, Package, Trash2, AlertTriangle } from 'lucide-react';

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [vendor, setVendor] = useState<Partial<Vendor>>({
    business_name: '',
    location: '',
    phone: '',
    products: [],
  });
  const [productInput, setProductInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setVendor(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const vendorData = {
        ...vendor,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('vendors')
        .upsert(vendorData, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  }

  const addProduct = () => {
    if (!productInput.trim()) return;
    const newProducts = [...(vendor.products || []), productInput.trim()];
    setVendor({ ...vendor, products: newProducts });
    setProductInput('');
  };

  const removeProduct = (index: number) => {
    const newProducts = vendor.products?.filter((_, i) => i !== index);
    setVendor({ ...vendor, products: newProducts });
  };

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Vendor listing removed.');
      setVendor({ business_name: '', location: '', phone: '', products: [] });
      setConfirmDelete(false);
    } catch (error: any) {
      toast.error(error.message || 'Error deleting listing');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Vendor Profile</h1>
        <p className="text-muted-foreground font-medium">Manage your business information and product listings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border shadow-sm rounded-[16px] overflow-hidden">
          <CardHeader className="bg-secondary border-b border-border">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Business Details
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Basic information about your company.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="font-bold text-xs uppercase tracking-wider">Business Name</Label>
              <Input
                id="business_name"
                value={vendor.business_name}
                onChange={(e) => setVendor({ ...vendor, business_name: e.target.value })}
                placeholder="e.g. Global Supplies Ltd"
                required
                className="rounded-[10px] border-border bg-secondary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="font-bold text-xs uppercase tracking-wider">Location (City)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={vendor.location}
                    onChange={(e) => setVendor({ ...vendor, location: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                    required
                    className="pl-10 rounded-[10px] border-border bg-secondary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-wider">Phone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={vendor.phone}
                    onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                    placeholder="e.g. +234 800 000 0000"
                    required
                    className="pl-10 rounded-[10px] border-border bg-secondary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-[16px] overflow-hidden">
          <CardHeader className="bg-secondary border-b border-border">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Products & Services
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Add keywords for products you sell or need.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                placeholder="e.g. Cement, Rice, Electronics..."
                className="rounded-[10px] border-border bg-secondary"
              />
              <Button type="button" onClick={addProduct} variant="secondary" className="rounded-[10px] font-bold">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-secondary rounded-[12px] border border-dashed border-border">
              {vendor.products && vendor.products.length > 0 ? (
                vendor.products.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-card border border-border px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {product}
                    <button type="button" onClick={() => removeProduct(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic">No products added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-[10px] font-bold transition-all shadow-lg shadow-primary/20"
          >
            {saving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Profile</span>
            )}
          </Button>
        </div>
      </form>

      {vendor.id && (
        <div className="border border-destructive/30 rounded-[16px] p-6 space-y-4 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </div>
          <p className="text-sm text-muted-foreground">
            Permanently removes your vendor listing from the directory. This cannot be undone.
          </p>
          {confirmDelete && (
            <p className="text-sm font-bold text-destructive">
              Are you sure? Click the button again to confirm deletion.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={handleDelete}
            className="border-destructive text-destructive hover:bg-destructive hover:text-white rounded-[10px] font-bold"
          >
            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {confirmDelete ? 'Confirm Delete' : 'Delete My Listing'}
              </span>
            )}
          </Button>
          {confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary ml-4"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

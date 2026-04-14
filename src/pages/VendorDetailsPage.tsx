import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, MessageSquare, ArrowLeft, Store, Package, Calendar } from 'lucide-react';

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVendor();
  }, [id]);

  async function fetchVendor() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" /></div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Vendor not found</h2>
        <Link to="/">
          <Button variant="outline">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const rawPhone = vendor.phone.replace(/[^0-9+]/g, '');
  // If the number doesn't start with +, assume it's a local number without country code
  // and flag it visually rather than silently generate a bad link
  const hasCountryCode = rawPhone.startsWith('+') || rawPhone.startsWith('00');
  const whatsappNumber = rawPhone.replace(/^\+/, '').replace(/^00/, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="bg-primary/10 h-20 w-20 rounded-[20px] flex items-center justify-center">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{vendor.business_name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(vendor.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Products & Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {vendor.products.map((product, idx) => (
                <Badge key={idx} variant="secondary" className="bg-accent text-accent-foreground text-sm px-4 py-1.5 rounded-full font-bold border-none">
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-2xl rounded-[16px] overflow-hidden sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-extrabold text-lg">Contact Vendor</h3>
              
              <div className="space-y-3">
                <a href={`tel:${vendor.phone}`} className="block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-[10px] flex items-center gap-2 font-bold shadow-lg shadow-primary/20">
                    <Phone className="h-4 w-4" />
                    Call Vendor
                  </Button>
                </a>
                
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full border-border h-12 rounded-[10px] flex items-center gap-2 hover:bg-secondary transition-all font-bold">
                    <MessageSquare className="h-4 w-4" />
                    Chat on WhatsApp
                  </Button>
                </a>
                {!hasCountryCode && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ This number may be missing a country code (e.g. +234). WhatsApp requires the full international format.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  Always verify vendor identity before making payments or sharing sensitive business data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

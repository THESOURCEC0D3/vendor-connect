import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Package, Plus, Info, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface DirectoryPageProps {
  user: SupabaseUser | null;
}

const CATEGORIES = ['Construction', 'Electronics', 'Agro', 'Logistics'];
const PAGE_SIZE = 12;

export default function DirectoryPage({ user }: DirectoryPageProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myVendor, setMyVendor] = useState<Vendor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVendors();
    if (user) fetchMyVendor();
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    let results = vendors;

    if (query) {
      results = results.filter(vendor =>
        vendor.business_name.toLowerCase().includes(query) ||
        vendor.products.some(p => p.toLowerCase().includes(query)) ||
        vendor.location.toLowerCase().includes(query)
      );
    }

    if (activeCategory) {
      results = results.filter(vendor =>
        vendor.products.some(p => p.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    }

    setFilteredVendors(results);
    setCurrentPage(1);
  }, [searchQuery, activeCategory, vendors]);

  async function fetchVendors() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
      setFilteredVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyVendor() {
    if (!user) return;
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setMyVendor(data);
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => (prev === category ? null : category));
    setSearchQuery('');
  };

  const totalPages = Math.ceil(filteredVendors.length / PAGE_SIZE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="bento-grid">
      {/* Search Area */}
      <div className="bento-card col-span-1 lg:col-span-2 justify-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          Vendor Search
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products (e.g. 'cement', 'solar', 'grains')..."
            className="pl-10 h-12 bg-secondary border-border rounded-[10px] focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveCategory(null);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((tag) => (
            <Button
              key={tag}
              variant="secondary"
              onClick={() => handleCategoryClick(tag)}
              className={`cursor-pointer px-2 py-0.5 text-[10px] font-bold rounded-[4px] border-none transition-colors ${
                activeCategory === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bento-card bg-primary text-primary-foreground justify-center items-center text-center">
        <div className="text-4xl font-extrabold">{vendors.length}</div>
        <div className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
          Verified Vendors
        </div>
      </div>

      {/* Sidebar */}
      <div className="bento-card gap-5">
        <div className="space-y-4">
          <div className="font-bold text-sm">Quick Actions</div>
          <Link to="/profile" className="block w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-[8px] font-bold text-sm py-5">
              <Plus className="mr-2 h-4 w-4" />{" "}
              {myVendor ? "Edit My Business" : "List My Business"}
            </Button>
          </Link>
        </div>

        <div className="space-y-2 pt-4">
          <div className="font-bold text-sm flex items-center gap-2">
            <Info className="h-4 w-4" /> Tips
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Complete your profile keywords to help other vendors find you
            faster.
          </p>
        </div>

        {user && (
          <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-[11px] leading-tight">
              <span className="font-bold block truncate max-w-[150px]">
                {myVendor?.business_name || user.email}
              </span>
              <span className="text-muted-foreground">
                {myVendor?.location || "Profile incomplete"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Directory */}
      <div className="lg:col-span-2 space-y-5">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 rounded-[16px] bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : paginatedVendors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedVendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="bg-card border-border rounded-[12px] p-5 flex flex-col justify-between shadow-none hover:border-primary transition-colors group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg leading-tight">
                        {vendor.business_name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-[4px] font-medium">
                        {vendor.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {vendor.products.map((product, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-accent text-accent-foreground border-none px-2 py-0.5 text-[10px] font-bold rounded-[4px]"
                        >
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link to={`/vendor/${vendor.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-border bg-card hover:bg-secondary rounded-[8px] font-bold text-sm mt-2"
                    >
                      Contact Vendor
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Page {currentPage} of {totalPages} &mdash;{" "}
                  {filteredVendors.length} vendors
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-[8px] border-border font-bold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-[8px] border-border font-bold"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bento-card items-center justify-center py-20 space-y-4 text-center">
            <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No vendors found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

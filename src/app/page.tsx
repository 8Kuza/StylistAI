"use client";

import { useState } from "react";
import { Upload, ShoppingBag, ArrowRight, Check, X, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  platform: string;
  url: string;
}

interface OutfitIdea {
  description: string;
  searchQuery: string;
  products?: Product[];
}

interface AnalysisResult {
  category: string;
  color: string;
  styleTags: string[];
  brand?: string;
  outfitIdeas?: OutfitIdea[];
}

interface PriceVerdict {
  verdict: 'STEAL' | 'FAIR' | 'OVERPRICED' | null;
  medianPrice: number;
  lowestPrice: number;
  highestPrice: number;
  range: { min: number; max: number };
}

interface ApiResponse {
  analysis: AnalysisResult;
  similarProducts: Product[];
  pricing: PriceVerdict | null;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrice, setUserPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null); // Reset results on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          userPrice: userPrice ? parseFloat(userPrice) : undefined,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <ShoppingBag className="w-8 h-8 text-rose-500" />
            <span>FitCheck AI</span>
          </div>
          <p className="text-neutral-400 max-w-md mx-auto">
            Upload a photo of any clothing item. We'll identify it, tell you if it's a steal, and show you how to style it.
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-12 space-y-6">
          <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="grid place-items-center border-2 border-dashed border-neutral-800 rounded-xl p-8 hover:border-neutral-700 transition-colors bg-neutral-950/50">
                {selectedImage ? (
                  <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden ring-1 ring-neutral-800">
                    <Image
                      src={selectedImage}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => { setSelectedImage(null); setResult(null); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4 py-8 w-full group">
                    <div className="p-4 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                      <Upload className="w-8 h-8 text-neutral-400 group-hover:text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-lg">Click to upload or drag & drop</p>
                      <p className="text-sm text-neutral-500">JPG or PNG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {selectedImage && (
                <div className="flex gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid gap-2 flex-1">
                    <label className="text-sm font-medium text-neutral-400 ml-1">
                      Price (Optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 45.00"
                      className="bg-neutral-950 border-neutral-800 focus:border-rose-500/50"
                      value={userPrice}
                      onChange={(e) => setUserPrice(e.target.value)}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-8"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Check Fit
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Verdict Banner */}
            {result.pricing && result.pricing.verdict && (
              <div className={`
                p-6 rounded-xl border flex items-center justify-between
                ${result.pricing.verdict === 'STEAL' ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' :
                  result.pricing.verdict === 'OVERPRICED' ? 'bg-red-950/30 border-red-900 text-red-400' :
                    'bg-blue-950/30 border-blue-900 text-blue-400'}
              `}>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Verdict: {result.pricing.verdict}
                  </h3>
                  <p className="opacity-90 text-sm">
                    {result.pricing.verdict === 'STEAL' ? "This price is lower than 75% of similar items!" :
                      result.pricing.verdict === 'OVERPRICED' ? "You can find this cheaper elsewhere." :
                        "This price is fair for the current market."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-secondary-foreground text-xs uppercase tracking-wider font-semibold opacity-70">Median Price</p>
                  <p className="text-2xl font-bold">${result.pricing.medianPrice.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Analysis Details */}
              <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                      {result.analysis.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                      {result.analysis.color}
                    </Badge>
                    {result.analysis.brand && (
                      <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                        {result.analysis.brand}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {result.analysis.styleTags.map(tag => (
                      <span key={tag} className="text-xs text-neutral-300 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Separator className="bg-neutral-800 my-4" />
                  <div>
                    <h4 className="font-medium text-sm text-neutral-200 mb-4">Styling Ideas</h4>
                    <div className="space-y-6">
                      {result.analysis.outfitIdeas?.map((idea, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex gap-2 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <p className="text-sm text-neutral-200">{idea.description}</p>
                          </div>

                          {/* Styling Products Carousel */}
                          {idea.products && idea.products.length > 0 && (
                            <div className="pl-3.5 border-l border-neutral-800 ml-[3px]">
                              <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider font-semibold">Shop this look</p>
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
                                {idea.products.map(prod => (
                                  <a
                                    key={prod.id}
                                    href={prod.url}
                                    target="_blank"
                                    className="shrink-0 w-32 group"
                                  >
                                    <div className="aspect-[4/5] relative rounded-md overflow-hidden bg-neutral-800 mb-2 grid place-items-center">
                                      {prod.imageUrl ? (
                                        <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-full w-full bg-neutral-800 text-neutral-500 gap-1 p-2 text-center">
                                          <ExternalLink className="w-5 h-5 mb-1 opacity-50" />
                                          <span className="text-[10px] uppercase font-bold tracking-wider">{prod.platform}</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium truncate text-neutral-300 group-hover:text-rose-400 transition-colors">{prod.name}</p>
                                    <p className="text-xs text-neutral-400">{prod.price ? `$${prod.price}` : 'Check Price'}</p>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Items */}
              <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-lg">Similar Listings</CardTitle>
                  <CardDescription>Found {result.similarProducts.length} matches across the web</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {result.similarProducts.map((prod) => (
                      <a
                        key={prod.id}
                        href={prod.url}
                        target="_blank"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-neutral-800 grid place-items-center">
                          {prod.imageUrl ? (
                            <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                          ) : (
                            <ExternalLink className="w-5 h-5 text-neutral-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-rose-400 transition-colors">{prod.name}</p>
                          <p className="text-xs text-neutral-500">{prod.platform}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-emerald-400">{prod.price ? `$${prod.price}` : 'Check'}</p>
                          <ArrowRight className="w-4 h-4 text-neutral-600 -rotate-45 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

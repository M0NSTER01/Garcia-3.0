import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shirt, User, Upload, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VirtualTryOn: React.FC = () => {
    const [personImage, setPersonImage] = useState<string | null>(null);
    const [garmentImage, setGarmentImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'garment') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'person') {
                    setPersonImage(reader.result as string);
                } else {
                    setGarmentImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!personImage || !garmentImage) {
            toast.error('Please upload both a person image and a garment image.');
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            // Call the backend endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/try-on`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personImage,
                    garmentImage
                }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Received non-JSON response:', text);
                throw new Error('Server returned an error (check console for details). Did you restart the backend?');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (data.imageUrl) {
                setGeneratedImage(data.imageUrl);
                toast.success('Try-on successful! Here is your look.');
            } else {
                throw new Error('No image URL returned');
            }

        } catch (error) {
            console.error('Try-on error:', error);
            toast.error('Failed to generate try-on: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Virtual Try-On</CardTitle>
                            <CardDescription>See how clothes look on you before you buy with AI</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Inputs */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Your Photo
                                </Label>
                                <div className="border-2 border-dashed border-border/60 rounded-xl p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 text-center min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleImageUpload(e, 'person')}
                                    />

                                    {personImage ? (
                                        <div className="relative w-full h-full min-h-[200px]">
                                            <img
                                                src={personImage}
                                                alt="Person"
                                                className="w-full h-full object-contain rounded-lg max-h-[300px]"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Upload className="h-4 w-4" /> Change Photo
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Click to upload image</p>
                                            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <Shirt className="h-4 w-4 text-muted-foreground" />
                                    Garment Photo
                                </Label>
                                <div className="border-2 border-dashed border-border/60 rounded-xl p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 text-center min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleImageUpload(e, 'garment')}
                                    />

                                    {garmentImage ? (
                                        <div className="relative w-full h-full min-h-[200px]">
                                            <img
                                                src={garmentImage}
                                                alt="Garment"
                                                className="w-full h-full object-contain rounded-lg max-h-[300px]"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Upload className="h-4 w-4" /> Change Photo
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Click to upload image</p>
                                            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-base shadow-lg shadow-primary/20"
                                size="lg"
                                onClick={handleGenerate}
                                disabled={!personImage || !garmentImage || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Trying on...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate Try-On
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Result */}
                        <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border/40 overflow-hidden">
                            <div className="p-4 border-b border-border/40 bg-card/30">
                                <Label className="text-base font-medium">Result</Label>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
                                {generatedImage ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={generatedImage}
                                            alt="Generated Try-On"
                                            className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md"
                                        />
                                    </div>
                                ) : isGenerating ? (
                                    <div className="text-center space-y-4">
                                        <div className="relative h-20 w-20 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-medium text-foreground">Creating your look</p>
                                            <p className="text-sm text-muted-foreground">This usually takes 10-20 seconds...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground max-w-[200px]">
                                        <Shirt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>Upload photos and click Generate to see the magic happen</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VirtualTryOn;

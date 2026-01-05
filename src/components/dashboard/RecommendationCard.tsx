
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StyleRecommendation } from '@/contexts/StyleContext';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import BlurContainer from '../ui/BlurContainer';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: StyleRecommendation;
  onClear: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onClear }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-display flex items-center justify-between">
          <span>Your Style Recommendations</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2 text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            New Analysis
          </Button>
        </CardTitle>
        <CardDescription>
          Based on your {expandedSection ? 'body type' : recommendation.bodyType + ' body type'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Body Type Section */}
        <div className="space-y-2">
          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => toggleSection('bodyType')}
          >
            <Label className="text-lg font-medium">Your Body Type</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 group-hover:bg-muted"
            >
              {expandedSection === 'bodyType' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className={cn("transition-all duration-300 overflow-hidden",
            expandedSection === 'bodyType' ? "max-h-96" : "max-h-0"
          )}>
            <BlurContainer className="p-4 mt-2 bg-muted/30 dark:bg-white/5 border border-border/50">
              <p className="text-sm leading-relaxed text-foreground/90">
                You have an <strong>{recommendation.bodyType}</strong> body type. This means your shoulders and hips are balanced with a well-defined waist. Your proportions are considered the "ideal" figure by many fashion standards, making many styles work well for you.
              </p>
              <p className="text-sm leading-relaxed mt-2 text-foreground/90">
                For this body type, it's great to accentuate your waist. Fitted clothes that follow your curves will complement your natural shape, while garments that cinch at the waist will enhance your proportions.
              </p>
            </BlurContainer>
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <Label className="text-lg font-medium">Recommended Colors</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {recommendation.colorPalette.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="h-10 w-10 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
                <span className="text-xs mt-1 font-medium text-center px-1">{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clothing Recommendations Tabs */}
        <div className="pt-2">
          <Tabs defaultValue="tops" className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full">
              <TabsTrigger value="tops">Tops</TabsTrigger>
              <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
              {recommendation.dresses && (
                <TabsTrigger value="dresses">Dresses</TabsTrigger>
              )}
              <TabsTrigger value="outfits">Outfits</TabsTrigger>
            </TabsList>

            <div className="mt-4 p-4 rounded-lg bg-muted/30 dark:bg-card border border-border/50">
              <TabsContent value="tops" className="space-y-3 mt-0">
                <h4 className="font-medium text-foreground">Recommended Tops</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {recommendation.tops.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="bottoms" className="space-y-3 mt-0">
                <h4 className="font-medium text-foreground">Recommended Bottoms</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {recommendation.bottoms.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              {recommendation.dresses && (
                <TabsContent value="dresses" className="space-y-3 mt-0">
                  <h4 className="font-medium text-foreground">Recommended Dresses</h4>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {recommendation.dresses.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </TabsContent>
              )}

              <TabsContent value="outfits" className="space-y-3 mt-0">
                <h4 className="font-medium text-foreground">Complete Outfit Ideas</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {recommendation.outfits.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Accessories */}
        <div className="space-y-2">
          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => toggleSection('accessories')}
          >
            <Label className="text-lg font-medium">Recommended Accessories</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 group-hover:bg-muted"
            >
              {expandedSection === 'accessories' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className={cn("transition-all duration-300 overflow-hidden",
            expandedSection === 'accessories' ? "max-h-96" : "max-h-0"
          )}>
            <BlurContainer className="p-4 mt-2 bg-muted/30 dark:bg-white/5 border border-border/50">
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {recommendation.accessories.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            </BlurContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;

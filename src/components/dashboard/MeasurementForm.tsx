import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useStyle, BodyMeasurements } from '@/contexts/StyleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Form schema
const formSchema = z.object({
  height: z.number().min(100, 'Height should be at least 100cm').max(250, 'Height should be less than 250cm'),
  weight: z.number().min(30, 'Weight should be at least 30kg').max(250, 'Weight should be less than 250kg'),
  bust: z.number().min(50, 'Bust should be at least 50cm').max(150, 'Bust should be less than 150cm').optional(),
  waist: z.number().min(40, 'Waist should be at least 40cm').max(150, 'Waist should be less than 150cm'),
  hips: z.number().min(50, 'Hips should be at least 50cm').max(150, 'Hips should be less than 150cm').optional(),
  shoulders: z.number().min(30, 'Shoulder width should be at least 30cm').max(80, 'Shoulder width should be less than 80cm').optional(),
  inseam: z.number().min(40, 'Inseam should be at least 40cm').max(120, 'Inseam should be less than 120cm').optional(),
});

const MeasurementForm = () => {
  const { user } = useAuth();
  const { saveMeasurements, getRecommendationByMeasurements, isLoading } = useStyle();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BodyMeasurements>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: 170,
      weight: 70,
      waist: 80,
      // Optional fields initialized to undefined
      bust: undefined,
      hips: undefined,
      shoulders: undefined,
      inseam: undefined,
    }
  });

  const isFemale = user?.gender === 'female';

  const onSubmit = async (data: BodyMeasurements) => {
    setIsSubmitting(true);
    try {
      // Add gender to the measurements data
      const measurementsWithGender = {
        ...data,
        gender: user?.gender || 'unspecified' // Use user's gender or default to unspecified
      };
      saveMeasurements(measurementsWithGender);
      await getRecommendationByMeasurements();
      toast.success('Measurements submitted successfully!');
    } catch (error) {
      console.error('Error submitting measurements:', error);
      toast.error('Failed to process measurements. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-display">Your Measurements</CardTitle>
        <CardDescription>
          Enter your body measurements for accurate style recommendations
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                {...register('height', { valueAsNumber: true })}
              />
              {errors.height && (
                <p className="text-xs text-red-500">{errors.height.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                {...register('weight', { valueAsNumber: true })}
              />
              {errors.weight && (
                <p className="text-xs text-red-500">{errors.weight.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Female-specific measurements */}
            {isFemale && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bust">Bust (cm)</Label>
                  <Input
                    id="bust"
                    type="number"
                    {...register('bust', { valueAsNumber: true })}
                  />
                  {errors.bust && (
                    <p className="text-xs text-red-500">{errors.bust.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    {...register('hips', { valueAsNumber: true })}
                  />
                  {errors.hips && (
                    <p className="text-xs text-red-500">{errors.hips.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Common measurements */}
            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                {...register('waist', { valueAsNumber: true })}
              />
              {errors.waist && (
                <p className="text-xs text-red-500">{errors.waist.message}</p>
              )}
            </div>
            
            {/* Male-specific measurements */}
            {!isFemale && (
              <div className="space-y-2">
                <Label htmlFor="shoulders">Shoulders (cm)</Label>
                <Input
                  id="shoulders"
                  type="number"
                  {...register('shoulders', { valueAsNumber: true })}
                />
                {errors.shoulders && (
                  <p className="text-xs text-red-500">{errors.shoulders.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Optional additional measurements */}
          <div className="space-y-2">
            <Label htmlFor="inseam">Inseam (cm) - Optional</Label>
            <Input
              id="inseam"
              type="number"
              {...register('inseam', { valueAsNumber: true })}
            />
            {errors.inseam && (
              <p className="text-xs text-red-500">{errors.inseam.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-garcia-600 hover:bg-garcia-700" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Get Style Recommendations'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MeasurementForm;

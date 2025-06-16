
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Palette, Check } from "lucide-react";
import { useTheme, themes } from "@/contexts/ThemeContext";

const ThemeSelector = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <Palette className="w-4 h-4 mr-2" />
          Customize Theme
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Choose Theme</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                currentTheme.id === theme.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{theme.name}</CardTitle>
                  {currentTheme.id === theme.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <div className={`w-8 h-8 rounded ${theme.colors.correct} border-2 border-white shadow-sm`} />
                  <div className={`w-8 h-8 rounded ${theme.colors.present} border-2 border-white shadow-sm`} />
                  <div className={`w-8 h-8 rounded ${theme.colors.absent} border-2 border-white shadow-sm`} />
                </div>
                <div className="text-sm text-gray-600">
                  Preview tiles with {theme.name.toLowerCase()} colors
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ThemeSelector;

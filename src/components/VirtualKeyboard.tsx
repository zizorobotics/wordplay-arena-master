
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Record<string, 'correct' | 'present' | 'absent' | ''>;
  disabled?: boolean;
}

const VirtualKeyboard = ({ onKeyPress, usedLetters, disabled = false }: VirtualKeyboardProps) => {
  const { currentTheme } = useTheme();

  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const getKeyStyle = (letter: string) => {
    const status = usedLetters[letter];
    let bgColor = 'bg-gray-200 hover:bg-gray-300';
    let textColor = 'text-gray-800';

    if (disabled) {
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-400';
    } else {
      switch (status) {
        case 'correct':
          bgColor = currentTheme.colors.correct.replace('bg-', 'bg-') + ' hover:opacity-80';
          textColor = 'text-white';
          break;
        case 'present':
          bgColor = currentTheme.colors.present.replace('bg-', 'bg-') + ' hover:opacity-80';
          textColor = 'text-white';
          break;
        case 'absent':
          bgColor = currentTheme.colors.absent.replace('bg-', 'bg-') + ' hover:opacity-80';
          textColor = 'text-white';
          break;
      }
    }

    return `${bgColor} ${textColor}`;
  };

  const handleKeyClick = (key: string) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Row */}
      <div className="flex justify-center gap-1 mb-2">
        {topRow.map((letter) => (
          <Button
            key={letter}
            variant="outline"
            size="sm"
            onClick={() => handleKeyClick(letter)}
            disabled={disabled}
            className={`w-10 h-10 p-0 font-semibold border-0 ${getKeyStyle(letter)}`}
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* Middle Row */}
      <div className="flex justify-center gap-1 mb-2">
        {middleRow.map((letter) => (
          <Button
            key={letter}
            variant="outline"
            size="sm"
            onClick={() => handleKeyClick(letter)}
            disabled={disabled}
            className={`w-10 h-10 p-0 font-semibold border-0 ${getKeyStyle(letter)}`}
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="flex justify-center gap-1">
        <Button
          variant="outline"
          onClick={() => handleKeyClick('ENTER')}
          disabled={disabled}
          className={`px-3 h-10 font-semibold border-0 ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          ENTER
        </Button>
        
        {bottomRow.map((letter) => (
          <Button
            key={letter}
            variant="outline"
            size="sm"
            onClick={() => handleKeyClick(letter)}
            disabled={disabled}
            className={`w-10 h-10 p-0 font-semibold border-0 ${getKeyStyle(letter)}`}
          >
            {letter}
          </Button>
        ))}
        
        <Button
          variant="outline"
          onClick={() => handleKeyClick('BACKSPACE')}
          disabled={disabled}
          className={`px-3 h-10 font-semibold border-0 ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          ⌫
        </Button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;


import React from 'react';
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Record<string, 'correct' | 'present' | 'absent' | ''>;
}

const VirtualKeyboard = ({ onKeyPress, usedLetters }: VirtualKeyboardProps) => {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const getKeyStyle = (letter: string) => {
    const result = usedLetters[letter];
    switch (result) {
      case 'correct':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'present':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'absent':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  const renderKey = (letter: string, extraClasses: string = '') => (
    <Button
      key={letter}
      onClick={() => onKeyPress(letter)}
      className={`h-12 font-semibold transition-all duration-200 ${getKeyStyle(letter)} ${extraClasses}`}
    >
      {letter}
    </Button>
  );

  return (
    <div className="select-none">
      {/* Top row */}
      <div className="flex justify-center gap-1 mb-2">
        {topRow.map(letter => renderKey(letter, 'px-3'))}
      </div>

      {/* Middle row */}
      <div className="flex justify-center gap-1 mb-2">
        {middleRow.map(letter => renderKey(letter, 'px-3'))}
      </div>

      {/* Bottom row */}
      <div className="flex justify-center gap-1">
        <Button
          onClick={() => onKeyPress('ENTER')}
          className="h-12 px-4 font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
        >
          ENTER
        </Button>
        {bottomRow.map(letter => renderKey(letter, 'px-3'))}
        <Button
          onClick={() => onKeyPress('BACKSPACE')}
          className="h-12 px-4 font-semibold bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
        >
          <Delete className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;

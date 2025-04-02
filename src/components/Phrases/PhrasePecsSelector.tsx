import React from "react";
import { useTranslation } from "react-i18next";
import PictogramSelector from "../Sequences/PictogramSelector";

interface PhrasePecsSelectorProps {
  onSelect: (pecs: { id: string; image_url: string; name: string }) => void;
}

const PhrasePecsSelector = ({ onSelect }: PhrasePecsSelectorProps) => {
  const { t } = useTranslation();

  // Wrapper per la funzione onSelect
  const handleSelect = (pecs: { id: string; image_url: string; name: string }) => {
    console.log("PhrasePecsSelector - handleSelect - pecs:", pecs);
    
    // Chiama la funzione onSelect con i dati del PECS selezionato
    onSelect(pecs);
  };

  // We're using the existing PictogramSelector component
  // but now we're wrapping the onSelect callback
  return <PictogramSelector onSelect={handleSelect} />;
};

export default PhrasePecsSelector;

import React from "react";
import { useTranslation } from "react-i18next";
import PictogramSelector from "../Sequences/PictogramSelector";

interface PhrasePecsSelectorProps {
  onSelect: (pecs: { id: string; image_url: string; name: string }) => void;
}

const PhrasePecsSelector = ({ onSelect }: PhrasePecsSelectorProps) => {
  const { t } = useTranslation();

  // We're using the existing PictogramSelector component
  // and just passing through the onSelect callback
  return <PictogramSelector onSelect={onSelect} />;
};

export default PhrasePecsSelector;

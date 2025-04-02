import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
  Image,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnalyzeService } from "../../client/sdk.gen";
import type { PictogramResponse } from "../../client/types.gen";
import useCustomToast from "../../hooks/useCustomToast";
import { Field } from "../ui/field";

interface PictogramSelectorProps {
  onSelect: (pictogram: { id: string; image_url: string; name: string }) => void;
}

const PictogramSelector = ({ onSelect }: PictogramSelectorProps) => {
  const [word, setWord] = useState("");
  const [imageOptions, setImageOptions] = useState<PictogramResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { showErrorToast } = useCustomToast();

  const searchImageOptions = async () => {
    if (!word.trim()) {
      showErrorToast("Inserisci una parola per cercare le immagini");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setImageOptions([]);

    try {
      const response = await AnalyzeService.getOptions({
        requestBody: { word: word },
        language: i18n.language || 'it',
      });

      if (Array.isArray(response)) {
        setImageOptions(response);
        setSearchError(null);
        setSearchSuccess(`Trovati pittogrammi per "${word}"`);
      } else {
        console.error("Errore nella risposta API:", response);
        setSearchError("Errore nella risposta API");
        setImageOptions([]);
      }
    } catch (error) {
      setSearchError("Errore durante la ricerca delle immagini");
      console.error("Errore durante la ricerca delle immagini:", error);
      setImageOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectImage = (option: PictogramResponse) => {
    console.log("PictogramSelector - selectImage - option:", option);
    
    const pictogram = {
      id: option.id?.toString() || crypto.randomUUID(),
      image_url: option.url || '',
      name: option.word || '',
    };
    
    console.log("PictogramSelector - selectImage - pictogram:", pictogram);
    
    // Chiama la funzione onSelect con i dati del PECS selezionato
    onSelect(pictogram);

    // Reset the search
    setWord("");
    setImageOptions([]);
    setSearchSuccess(null);
    setSearchError(null);
  };

  return (
    <VStack gap={4} align="stretch">
      <Field label="Cerca Pittogramma">
        <HStack>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Inserisci una parola"
            type="text"
          />
          <Button
            onClick={searchImageOptions}
            loading={isSearching}
            loadingText="Cercando..."
            variant="outline"
          >
            <FaSearch />
            Cerca
          </Button>
        </HStack>
      </Field>

      {isSearching && (
        <Box textAlign="center" py={4}>
          <Spinner size="md" />
          <Text mt={2}>Ricerca immagini in corso...</Text>
        </Box>
      )}

      {searchError && (
        <Box p={3} bg="red.50" color="red.600" borderRadius="md">
          <Text>{searchError}</Text>
        </Box>
      )}

      {searchSuccess && !searchError && (
        <Box p={3} bg="green.50" color="green.600" borderRadius="md">
          <Text>{searchSuccess}</Text>
        </Box>
      )}

      {imageOptions.length > 0 && (
        <SimpleGrid columns={2} >
          {imageOptions.map((option) => (
            <Box key={option.id} borderWidth="1px" borderRadius="md" overflow="hidden">
              <Image
                src={option.url || ''}
                alt={option.word || ''}
                width="100%"
                height="150px"
                objectFit="contain"
                p={2}
              />
              <Text textAlign="center" p={2} bg="gray.50" fontWeight="medium">
                {option.word}
              </Text>
              <Button onClick={() => selectImage(option)} width="100%">
                {t("common.select", "Seleziona")}
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default PictogramSelector;

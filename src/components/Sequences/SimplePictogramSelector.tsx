import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

import { PictogramService } from "../../client/services/PictogramService";
import useCustomToast from "../../hooks/useCustomToast";
import { Button } from "../ui/button";

interface SimplePictogramSelectorProps {
  onSelect: (pictogram: { id: string; image_url: string; name: string }) => void;
}

const SimplePictogramSelector = ({ onSelect }: SimplePictogramSelectorProps) => {
  const [word, setWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const searchAndAddPictogram = async () => {
    if (!word.trim()) {
      showErrorToast("Inserisci una parola per cercare le immagini");
      return;
    }

    setIsSearching(true);

    try {
      const response = await PictogramService.getImageOptions(word);
      
      console.log("Risposta API:", response);
      
      // Verifica se la risposta è un array
      if (Array.isArray(response)) {
        if (response.length > 0 && !response[0].error) {
          // Prendi il primo elemento dell'array
          const firstOption = response[0];
          const id = `temp-${Date.now()}`;
          
          // Seleziona direttamente il pittogramma
          onSelect({
            id,
            image_url: firstOption.url,
            name: firstOption.word,
          });
          
          showSuccessToast(`Pittogramma "${firstOption.word}" aggiunto alla sequenza`);
          setWord("");
        } else {
          console.error("Nessun pittogramma trovato nell'array:", response);
          showErrorToast("Nessun pittogramma trovato");
        }
      } else if (response && !response.error) {
        // Gestione per risposta singola (non array)
        const id = `temp-${Date.now()}`;
        
        // Seleziona direttamente il pittogramma
        onSelect({
          id,
          image_url: response.url,
          name: response.word,
        });
        
        showSuccessToast(`Pittogramma "${response.word}" aggiunto alla sequenza`);
        setWord("");
      } else {
        console.error("Risposta API non valida:", response);
        showErrorToast("Errore nella risposta API");
      }
    } catch (error) {
      showErrorToast("Errore durante la ricerca delle immagini");
      console.error("Errore durante la ricerca delle immagini:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Box>
      <Text fontWeight="medium" mb={2}>Aggiungi Pittogrammi</Text>
      <Flex gap={2}>
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Inserisci una parola"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchAndAddPictogram();
            }
          }}
        />
        <Button
          variant="outline"
          onClick={searchAndAddPictogram}
          disabled={isSearching}
        >
          {isSearching ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FaSearch style={{ marginRight: "8px" }} />
              Cerca
            </>
          )}
        </Button>
      </Flex>
    </Box>
  );
};

export default SimplePictogramSelector;
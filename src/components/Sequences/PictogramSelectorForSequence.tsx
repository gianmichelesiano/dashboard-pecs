import React, { useState } from "react";
import {
  Box,
  Text,
} from "@chakra-ui/react";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";

import { PictogramService } from "../../client/services/PictogramService";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface PictogramSelectorForSequenceProps {
  onSelect: (pictogram: { id: string; image_url: string; name: string; word?: string }) => void;
}

const PictogramSelectorForSequence = ({ onSelect }: PictogramSelectorForSequenceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccessToast } = useCustomToast();

  // Funzione che verrà chiamata quando un pittogramma viene selezionato
  const handlePictogramSelect = (imageUrl: string, word: string, id: string) => {
    onSelect({
      id,
      image_url: imageUrl,
      name: word,
      word: word, // Utilizziamo la parola cercata dall'utente
    });
    setIsOpen(false);
    showSuccessToast(`Pittogramma "${word}" aggiunto alla sequenza`);
  };

  // Componente interno che simula AddPictogram ma adattato per la selezione
  const PictogramSelector = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [word, setWord] = useState("");
    
    const searchImageOptions = async () => {
      if (!word.trim()) {
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await PictogramService.getImageOptions(word);
        
        console.log("Risposta API:", response);
        
        // Verifica se la risposta è un array
        if (Array.isArray(response)) {
          if (response.length > 0 && !response[0].error) {
            // Prendi il primo elemento dell'array
            const firstOption = response[0];
            const id = crypto.randomUUID();
            
            // Seleziona direttamente il pittogramma
            handlePictogramSelect(firstOption.url, firstOption.word, id);
          } else {
            console.error("Nessun pittogramma trovato nell'array:", response);
            setSearchError("Nessun pittogramma trovato");
          }
        } else if (response && !response.error) {
          // Gestione per risposta singola (non array)
          const id = crypto.randomUUID();
          
          // Seleziona direttamente il pittogramma
          handlePictogramSelect(response.url, response.word, id);
        } else {
          console.error("Risposta API non valida:", response);
          setSearchError("Errore nella risposta API");
        }
      } catch (error) {
        setSearchError("Errore durante la ricerca delle immagini");
        console.error("Errore durante la ricerca delle immagini:", error);
      } finally {
        setIsSearching(false);
      }
    };

    return (
      <Box>
        <Text fontWeight="medium" mb={2}>Aggiungi Pittogramma</Text>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          style={{ width: "100%" }}
        >
          <FaPlus style={{ marginRight: "8px" }} />
          Aggiungi Pittogramma
        </Button>
      </Box>
    );
  };

  return (
    <>
      <PictogramSelector /> 
      <DialogRoot
        size={{ base: "xs", md: "md" }}
        placement="center"
        open={isOpen}
        onOpenChange={({ open }) => {
          setIsOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Pittogramma</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <iframe 
              src="/category-pictograms?selector=true" 
              style={{ 
                width: "100%", 
                height: "500px", 
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)"
              }}
            />
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default PictogramSelectorForSequence;
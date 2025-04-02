import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type PictogramCreate } from "@/client/types/pictogram";
import {
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  HStack,
  Box,
  Image,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";

import { PictogramService } from "../../client/services/PictogramService";
import useCustomToast from "../../hooks/useCustomToast";
import { Button } from "../ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface AddPictogramToSequenceProps {
  sequenceId: string;
  onPictogramSelected: (pictogram: { id: string; image_url: string; name: string; word?: string }) => void;
}

const AddPictogramToSequence = ({ sequenceId, onPictogramSelected }: AddPictogramToSequenceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageOptions, setImageOptions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      word: "",
      image_url: "",
      is_custom: true,
      category_ids: [],
    },
  });

  const currentWord = watch("word");

  const searchImageOptions = async () => {
    if (!currentWord.trim()) {
      showErrorToast("Inserisci una parola per cercare le immagini");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setImageOptions([]);

    try {
      const response = await PictogramService.getImageOptions(currentWord);
      
      // Log della risposta per debug
      console.log("Risposta API:", response);
      
      // Verifica se la risposta è un array
      if (Array.isArray(response)) {
        if (response.length > 0 && !response[0].error) {
          // Seleziona il primo pittogramma dall'array
          selectImage(response[0].url);
          setValue("word", response[0].word);
          
          setSearchError(null);
          setSearchSuccess(`Trovato pittogramma per "${currentWord}"`);
        } else {
          console.error("Nessun pittogramma trovato nell'array:", response);
          setSearchError("Nessun pittogramma trovato");
          setImageOptions([]);
        }
      } else if (response && !response.error) {
        // Gestione per risposta singola (non array)
        selectImage(response.url);
        setValue("word", response.word);
        
        setSearchError(null);
        setSearchSuccess(`Trovato pittogramma per "${currentWord}"`);
      } else {
        console.error("Risposta API non valida:", response);
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

  const selectImage = (imageUrl: string) => {
    setValue("image_url", imageUrl, { shouldValidate: true });
    setSelectedImageUrl(imageUrl);
    setSearchSuccess(`Immagine selezionata con successo`);
  };

  // Funzione per resettare tutti gli stati
  const resetAllStates = () => {
    setImageOptions([]);
    setSearchError(null);
    setSearchSuccess(null);
    setSelectedImageUrl(null);
  };

  // Funzione per aggiungere un pittogramma
  const addPictogram = (e: React.MouseEvent) => {
    // Preveniamo la propagazione dell'evento
    e.stopPropagation();
    
    if (isValid) {
      const data = {
        word: watch("word"),
        image_url: watch("image_url"),
        is_custom: true,
        category_ids: [],
      };
      
      // Passiamo il pittogramma al componente padre
      onPictogramSelected({
        id: crypto.randomUUID(), // Utilizziamo un UUID valido invece di un ID temporaneo
        image_url: data.image_url,
        name: data.word,
        word: data.word, // Utilizziamo la parola cercata dall'utente
      });
      
      // Chiudiamo manualmente il dialog
      handleClose();
    }
  };

  // Funzione per gestire la chiusura manuale del dialog
  const handleClose = () => {
    // Reset del form e degli stati
    reset();
    resetAllStates();
    
    // Chiudiamo solo il dialog del pittogramma
    setIsOpen(false);
    
    // Importante: non influenziamo il dialog padre
    // Non chiamiamo nessuna funzione che potrebbe chiudere il dialog padre
    
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => {
        // Aggiorniamo lo stato solo se stiamo chiudendo il dialog
        if (!open) {
          // Reset del form e degli stati quando il dialog viene chiuso
          reset();
          resetAllStates();
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      }}
      // Impediamo la propagazione degli eventi al dialog padre
      onClick={(e) => e.stopPropagation()}
    >
    <DialogTrigger asChild>
      <Button variant="ghost">
        <FaPlus fontSize="16px" />
        Aggiungi Pittogramma
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Aggiungi Pittogramma</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Text mb={4}>Inserisci i dettagli per aggiungere un nuovo pittogramma.</Text>
        <VStack gap={4}>
          <Field
            required
            invalid={!!errors.word}
            errorText={errors.word?.message}
            label="Parola"
          >
            <HStack>
              <Input
                id="word"
                {...register("word", {
                  required: "La parola è obbligatoria.",
                })}
                placeholder="Parola"
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

          {selectedImageUrl && (
            <Box>
              <Text fontWeight="medium" mb={2}>
                Immagine selezionata:
              </Text>
              <Box
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                maxW="200px"
                mx="auto"
              >
                <Image
                  src={selectedImageUrl}
                  alt={currentWord}
                  width="100%"
                  height="150px"
                  objectFit="contain"
                  p={2}
                />
                <Text
                  textAlign="center"
                  p={2}
                  bg="gray.50"
                  fontWeight="medium"
                >
                  {currentWord}
                </Text>
              </Box>
            </Box>
          )}

          <Field
            required
            invalid={!!errors.image_url}
            errorText={errors.image_url?.message}
            label="URL Immagine"
          >
            <Input
              id="image_url"
              {...register("image_url", {
                required: "L'URL dell'immagine è obbligatorio.",
              })}
              placeholder="URL Immagine"
              type="text"
            />
          </Field>
        </VStack>
      </DialogBody>

      <DialogFooter gap={2}>
        <Button
          variant="subtle"
          colorPalette="gray"
          disabled={isSubmitting}
          onClick={(e) => {
            // Preveniamo la propagazione dell'evento
            e.stopPropagation();
            handleClose();
          }}
        >
          Annulla
        </Button>
        <Button
          variant="solid"
          disabled={!isValid}
          loading={isSubmitting}
          onClick={(e) => addPictogram(e)}
        >
          Aggiungi
        </Button>
      </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddPictogramToSequence;
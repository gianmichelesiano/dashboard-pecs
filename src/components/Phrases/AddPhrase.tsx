import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Box,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";

import { PhraseService } from "../../client/services/PhraseService";
import { CollectionService } from "../../client/services/CollectionService";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
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
import PhrasePecsDisplay from "./PhrasePecsDisplay";
import PhrasePecsSelector from "./PhrasePecsSelector";

// Struttura dati semplificata
interface PhraseFormData {
  text: string;
}



const AddPhrase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPecs, setSelectedPecs] = useState<Array<{
    id: string;
    image_url: string;
    name: string;
    position: number;
  }>>([]);
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { showSuccessToast } = useCustomToast();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [transformedResult, setTransformedResult] = useState<Array<{
    id: string;
    token: string;
    phrase: string;
    position: number;
  }> | null>(null);
  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => CollectionService.getAllCollections(0, 1000), // Ottieni tutte le collezioni
  });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PhraseFormData>({
    mode: "onBlur",
    defaultValues: {
      text: "",
    },
  });

  const handleTransform = async () => {
    try {
      const transformedPecs = await PhraseService.transformPecsFormat({
        pecs: selectedPecs,
        language: i18n.language // Aggiungiamo la lingua corrente
      });
      
      const pecsSequence = transformedPecs.map((pec) => ({
        id: pec.id,           // cambiato da pecs_id a id
        position: pec.position,
        token: pec.token,
        phrase: pec.phrase
      }));
  
      setTransformedResult(pecsSequence);
    } catch (error) {
      console.error('Error transforming PECS:', error);
      handleError(error as ApiError);
    }
  };

  // Mutation per creare la frase
  const createPhraseMutation = useMutation({
    mutationFn: async (data: PhraseFormData) => {
      // Get current user ID from the query client
      const currentUser = queryClient.getQueryData<{ id: string }>(["currentUser"]);
      
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      // Crea la frase con la lingua corrente dell'utente
      const phraseData = {
        user_id: currentUser.id,
        translations: [
          {
            language_code: i18n.language,
            text: data.text,
          }
        ],
        pecs_items: selectedPecs.map((pecs, index) => ({
          pecs_id: pecs.id,
          position: index,
        })),
        collection_ids: selectedCollections // Include collection_ids in the payload
      };
      
      return await PhraseService.createPhrase({
        requestBody: phraseData
      });
    },
    onSuccess: async (createdPhrase) => {
      // Se ci sono collezioni selezionate, associa la frase a ciascuna collezione
      if (selectedCollections.length > 0) {
        try {
          // Per ogni collezione selezionata, aggiungi la frase
          for (const collectionId of selectedCollections) {
            await fetch(`/api/v1/collections/${collectionId}/phrases/${createdPhrase.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          }
          showSuccessToast(t("common.success", "Operazione completata con successo"));
        } catch (error) {
          console.error("Errore nell'associazione delle collezioni:", error);
          showSuccessToast(t("phrases.partialSuccess", "Frase creata ma non associata a tutte le collezioni"));
        }
      } else {
        showSuccessToast(t("common.success", "Operazione completata con successo"));
      }
      
      reset();
      setSelectedPecs([]);
      setIsOpen(false);
      setSelectedCollections([]);
      
      // Invalida le query
      queryClient.invalidateQueries({ queryKey: ["phrases"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const onSubmit = (data: PhraseFormData) => {
    createPhraseMutation.mutate(data);
  };

  const handleAddPecs = (pecs: { id: string; image_url: string; name: string }) => {
    setSelectedPecs([...selectedPecs, { ...pecs, position: selectedPecs.length }]);
    setTransformedResult(null);
  };

  const handleRemovePecs = (index: number) => {
    setSelectedPecs(selectedPecs.filter((_, i) => i !== index));
    setTransformedResult(null); // Reset del risultato quando rimuovi un PECS
  };

  const handleReorderPecs = (newOrder: typeof selectedPecs) => {
    setSelectedPecs(newOrder);
    setTransformedResult(null);
  };

  return (
    <DialogRoot
      size={{ base: "sm", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-phrase" my={4}>
          <FaPlus fontSize="16px" />
          {t("phrases.add", "Aggiungi Frase")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("phrases.addPhrase", "Aggiungi Frase")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("phrases.addPhraseDescription", "Crea una nuova frase con una sequenza di PECS")}</Text>
            <VStack gap={4} align="stretch">
              {/* Solo un campo per il testo nella lingua corrente */}
              <Field
                invalid={!!errors.text}
                errorText={errors.text?.message}
                label={t("phrases.text", "Testo")}
              >
                <Input
                  id="text"
                  {...register("text")}
                  placeholder={t("phrases.textPlaceholder", "Inserisci il testo della frase")}
                  type="text"
                />
              </Field>

              {/* Select box per le collezioni (selezione multipla) */}
              <Field label={t("phrases.collections", "Collezioni")}>
                <select
                  className="chakra-input"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', borderColor: '#e2e8f0' }}
                  multiple
                  size={4}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setSelectedCollections(selectedOptions);
                  }}
                >
                  {collections?.map((collection: any) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name_custom}
                    </option>
                  ))}
                </select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {t("phrases.collectionsHelp", "Tieni premuto Ctrl (o Cmd su Mac) per selezionare più collezioni")}
                </Text>
              </Field>

              {/* Visualizzazione PECS selezionati */}
              <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <Text fontWeight="medium" mb={3}>{t("phrases.pecsSequence", "Sequenza PECS")}</Text>
                <PhrasePecsDisplay 
                  pecs={selectedPecs} 
                  onRemove={handleRemovePecs} 
                  onReorder={handleReorderPecs} 
                />
                <Button 
                  mt={3}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={handleTransform}
                  disabled={selectedPecs.length === 0}
                >
                  {t("phrases.create", "Crea")}
                </Button>

                {transformedResult && (
                  <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="medium" mb={2}>{t("phrases.transformedResult", "Risultato Trasformazione")}</Text>
                    <VStack align="stretch" >
                      {transformedResult.map((item, index) => (
                        <Box key={index} p={2} bg="white" borderRadius="md" shadow="sm">
                          <Text fontSize="sm" color="gray.600">Token: <strong>{item.token}</strong></Text>
                          <Text fontSize="sm" color="gray.600">Frase: <strong>{item.phrase}</strong></Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>

              {/* Selettore PECS */}
              <Box>
                <Text fontWeight="medium" mb={3}>{t("phrases.addPecs", "Aggiungi PECS")}</Text>
                <PhrasePecsSelector onSelect={handleAddPecs} />
              </Box>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                {t("common.cancel", "Annulla")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid || selectedPecs.length === 0}
              loading={isSubmitting}
            >
              {t("common.save", "Salva")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddPhrase;

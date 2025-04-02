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
  Flex,
  Badge,
  Textarea,
  Spinner,
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

interface PhraseFormData {
  text: string;
}

interface AnalyzedWord {
  word: string;
  id: number;
  url: string;
  error: string | null;
  origin?: string;
}

const AddPhrase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPecs, setSelectedPecs] = useState<Array<{
    id: string;
    image_url: string;
    name: string;
    position: number;
    origin?: string;
  }>>([]);
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [transformedResult, setTransformedResult] = useState<Array<{
    id: string;
    token: string;
    phrase: string;
    position: number;
  }> | null>(null);

  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      console.log("Caricamento collezioni...");
      const result = await CollectionService.getAllCollections(0, 1000);
      console.log("Collezioni caricate:", result);
      return result;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PhraseFormData>({
    mode: "onBlur",
    defaultValues: {
      text: "",
    },
  });

  const currentText = watch("text");

  const handleConvertText = async () => {
    if (!currentText.trim()) {
      showErrorToast(t("phrases.noTextError", "Inserisci un testo da convertire"));
      return;
    }

    setIsConverting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/analyze/process-phrase?language=${i18n.language}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phrase: currentText
        })
      });

      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }

      const data: AnalyzedWord[] = await response.json();
      console.log("Risultato analisi:", data);

      const newPecs = await Promise.all(
        data.map(async (item, index) => {
          if (item.error) {
            console.error(`Errore per la parola ${item.word}:`, item.error);
            return null;
          }

          return {
            id: item.id.toString(),
            image_url: item.url,
            name: item.word,
            position: selectedPecs.length + index,
            origin: item.origin || item.word
          };
        })
      );

      const validPecs = newPecs.filter(pecs => pecs !== null) as Array<{
        id: string;
        image_url: string;
        name: string;
        position: number;
        origin?: string;
      }>;

      if (validPecs.length > 0) {
        // Reset existing PECS sequence and set only the new ones
        setSelectedPecs(validPecs);
        setTransformedResult(null); // Reset also the transformed result
        showSuccessToast(t("phrases.conversionSuccess", "Frase convertita con successo"));
      } else {
        showErrorToast(t("phrases.conversionError", "Nessun PECS trovato per questa frase"));
      }
    } catch (error) {
      console.error('Errore nella conversione del testo:', error);
      showErrorToast(t("phrases.conversionError", "Errore nella conversione del testo"));
    } finally {
      setIsConverting(false);
    }
  };

  const createPhraseMutation = useMutation({
    mutationFn: async (data: PhraseFormData) => {
      const currentUser = queryClient.getQueryData<{ id: string }>(["currentUser"]);
      
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
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
          origin: pecs.origin
        })),
        collection_ids: selectedCollections,
        origin: data.text
      };
      
      return await PhraseService.createPhrase({
        requestBody: phraseData
      });
    },
    onSuccess: async (createdPhrase) => {
      if (selectedCollections.length > 0) {
        try {
          for (const collectionId of selectedCollections) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/v1/collections/${collectionId}/phrases/${createdPhrase.id}`, {
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
      
      queryClient.invalidateQueries({ queryKey: ["phrases"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const handleTransform = async () => {
    try {
      const transformedPecs = await PhraseService.transformPecsFormat({
        pecs: selectedPecs,
        language: i18n.language
      });
      
      const pecsSequence = transformedPecs.map((pec) => ({
        id: pec.id,
        position: pec.position,
        token: pec.token,
        phrase: pec.phrase
      }));
  
      setTransformedResult(pecsSequence);
      
      // Aggiorna anche la Sequenza PECS con i valori trasformati
      if (transformedPecs.length > 0) {
        // Esaminiamo la struttura dei dati trasformati per debug
        console.log("Transformed PECS data:", transformedPecs);
        
        // Manteniamo gli stessi PECS originali ma aggiungiamo il testo trasformato sopra
        const updatedPecs = selectedPecs.map((originalPec, index) => {
          // Troviamo il PECS trasformato corrispondente alla stessa posizione
          const transformedPec = transformedPecs.find(p => p.position === index) ||
                                transformedPecs[index] ||
                                null;
          
          if (!transformedPec) {
            return originalPec; // Mantieni l'originale se non c'è un corrispondente
          }
          
          return {
            ...originalPec, // Mantieni tutte le proprietà originali (inclusa image_url e name)
            // Il testo blu sopra il pittogramma (origin)
            origin: transformedPec.phrase || transformedPec.token || ''
          };
        });
        
        setSelectedPecs(updatedPecs);
        showSuccessToast(t("phrases.transformSuccess", "Sequenza PECS aggiornata con successo"));
      }
    } catch (error) {
      console.error('Error transforming PECS:', error);
      handleError(error as ApiError);
    }
  };

  const onSubmit = (data: PhraseFormData) => {
    if (selectedPecs.length === 0) {
      showErrorToast(t("phrases.noPecsError", "Aggiungi almeno un PECS alla sequenza prima di salvare."));
      return;
    }
    createPhraseMutation.mutate(data);
  };

  const handleAddPecs = (pecs: { id: string; image_url: string; name: string }) => {
    console.log("AddPhrase - handleAddPecs - pecs:", pecs);
    console.log("AddPhrase - handleAddPecs - selectedPecs prima:", selectedPecs);
    
    const newSelectedPecs = [...selectedPecs, { ...pecs, position: selectedPecs.length }];
    console.log("AddPhrase - handleAddPecs - newSelectedPecs dopo:", newSelectedPecs);
    
    setSelectedPecs(newSelectedPecs);
    setTransformedResult(null);
  };

  const handleRemovePecs = (index: number) => {
    setSelectedPecs(selectedPecs.filter((_, i) => i !== index));
    setTransformedResult(null);
  };

  const handleReorderPecs = (newOrder: typeof selectedPecs) => {
    setSelectedPecs(newOrder);
    setTransformedResult(null);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setIsCreatingCollection(true);
    try {
      const currentUser = queryClient.getQueryData<{ id: string }>(["currentUser"]);
      if (!currentUser?.id) throw new Error("User not authenticated");

      const newCollection = await CollectionService.createCollection({
        requestBody: {
          user_id: currentUser.id,
          name_custom: newCollectionName,
          is_custom: true,
          is_visible: true
        }
      });
      
      setSelectedCollections(prev => [...prev, newCollection.id]);
      setNewCollectionName("");
      setShowNewCollectionForm(false);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      showSuccessToast(t("phrases.collectionCreated", "Collezione creata con successo"));
    } catch (error) {
      handleError(error as ApiError);
    } finally {
      setIsCreatingCollection(false);
    }
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
            <VStack gap={6} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={2}>
                  {t("phrases.textInputTitle", "1. Inserisci Testo (Opzionale)")}
                </Text>
                <Field
                  invalid={!!errors.text}
                  errorText={errors.text?.message}
                >
                  <Flex 
                    direction="column" 
                    w="100%"
                  >
                    <Textarea
                      id="text"
                      {...register("text")}
                      placeholder={t("phrases.textPlaceholder", "Inserisci il testo e clicca Converti per generare PECS")}
                      resize="vertical"
                      w="100%"
                      mb={1}
                      rows={2}
                    />
                    <Button
                      size="md"
                      variant="outline"
                      colorScheme="blue"
                      onClick={handleConvertText}
                      loading={isConverting}
                      loadingText={t("phrases.converting", "Converto...")}
                      w="100%"
                    >
                      {t("phrases.convert", "Converti")}
                    </Button>
                  </Flex>
                </Field>
              </Box>

              <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <Text fontWeight="medium" mb={3}>
                  {t("phrases.pecsSequenceTitle", "2. Sequenza PECS")}
                </Text>
                {selectedPecs.length > 0 ? (
                  <PhrasePecsDisplay
                    pecs={selectedPecs}
                    onRemove={handleRemovePecs}
                    onReorder={handleReorderPecs}
                  />
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    {t("phrases.emptySequence", "La sequenza è vuota. Usa 'Converti' o aggiungi PECS manualmente qui sotto.")}
                  </Text>
                )}
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
                    <VStack align="stretch">
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

              <Box>
                <Text fontWeight="medium" mb={3}>
                  {t("phrases.addPecsManuallyTitle", "3. Aggiungi PECS Manualmente alla Sequenza")}
                </Text>
                <PhrasePecsSelector onSelect={handleAddPecs} />
              </Box>

              <Box>
                <Text fontWeight="medium" mb={3}>
                  {t("phrases.collectionsTitle", "4. Associa a Collezioni (Opzionale)")}
                </Text>
                 <Box mb={3}>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    {t("phrases.selectedCollections", "Collezioni selezionate")}:
                  </Text>
                  <Flex flexWrap="wrap" gap={1} mb={2}>
                    {selectedCollections.length > 0 ? (
                      collections
                        ?.filter(collection => selectedCollections.includes(collection.id))
                        .map(collection => (
                          <Badge
                            key={collection.id}
                            colorScheme="blue"
                            variant="solid"
                            size="sm"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                             {collection.name_custom}
                             <Box as="span" ml={1} cursor="pointer" onClick={() => setSelectedCollections(prev => prev.filter(id => id !== collection.id))}>×</Box>
                          </Badge>
                        ))
                    ) : (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        {t("phrases.noCollectionsSelected", "Nessuna collezione selezionata")}
                      </Text>
                    )}
                  </Flex>
                </Box>

                 <Flex justifyContent="space-between" alignItems="center" mb={2}>
                   <Text fontSize="sm" fontWeight="medium">
                    {t("phrases.availableCollections", "Collezioni disponibili")}:
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => setShowNewCollectionForm(true)}
                  >
                    <Box as="span" mr={1}>+</Box>
                    {t("phrases.newCollection", "Nuova collezione")}
                  </Button>
                </Flex>

                {showNewCollectionForm && (
                  <Box
                    mt={3}
                    p={3}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                     <Text fontSize="sm" fontWeight="medium" mb={2}>
                       {t("phrases.createNewCollection", "Crea nuova collezione")}
                     </Text>
                     <Flex gap={2}>
                      <Input
                        size="sm"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder={t("phrases.collectionNamePlaceholder", "Nome collezione")}
                      />
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={handleCreateCollection}
                        loading={isCreatingCollection}
                        loadingText={t("common.creating", "Creazione...")}
                      >
                        {t("common.create", "Crea")}
                      </Button>
                     </Flex>
                   </Box>
                )}

                {isLoadingCollections ? (
                  <Spinner size="sm" />
                ) : (
                  <Flex flexWrap="wrap" gap={1}>
                    {collections && collections.length > 0 ? (
                      collections
                        .filter(collection => !selectedCollections.includes(collection.id))
                        .map(collection => (
                          <Badge
                            key={collection.id}
                            cursor="pointer"
                            onClick={() => setSelectedCollections(prev => [...prev, collection.id])}
                            colorScheme="gray"
                            variant="outline"
                            size="sm"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {collection.name_custom}
                            <Box as="span" ml={1}>+</Box>
                          </Badge>
                        ))
                    ) : (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        {t("phrases.noAvailableCollections", "Nessuna collezione disponibile")}
                      </Text>
                    )}
                  </Flex>
                )}
              </Box>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting || isCreatingCollection}
                onClick={() => {
                  reset();
                  setSelectedPecs([]);
                  setSelectedCollections([]);
                  setShowNewCollectionForm(false);
                  setIsOpen(false);
                }}
              >
                {t("common.cancel", "Annulla")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid || selectedPecs.length === 0 || isSubmitting || isCreatingCollection}
              loading={isSubmitting}
              loadingText={t("common.saving", "Salvataggio...")}
            >
              {t("common.save", "Salva Frase")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddPhrase;

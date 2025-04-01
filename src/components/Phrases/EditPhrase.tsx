import React, { useState, useEffect } from "react";
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
import { FaEdit } from "react-icons/fa";
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

interface AnalyzedWord {
  word: string;
  id: number;
  url: string;
  error: string | null;
  origin?: string;
}

interface PhraseFormData {
  text: string;
}

interface EditPhraseProps {
  phraseId: string;
  phraseText: string;
}

const EditPhrase = ({ phraseId, phraseText }: EditPhraseProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPecs, setSelectedPecs] = useState<Array<{
    id: string;
    image_url: string;
    name: string;
    position: number;
    origin?: string; // Campo opzionale per il testo originale
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

  // Query per ottenere i dati della frase quando il modale è aperto
  const { data: phraseData, isLoading: isLoadingPhrase } = useQuery({
    queryKey: ["phrase", phraseId],
    queryFn: async () => {
      console.log("Caricamento dati della frase...");
      const result = await PhraseService.getPhrase(phraseId);
      console.log("Dati della frase caricati:", result);
      return result;
    },
    enabled: isOpen, // Esegui la query solo quando il modale è aperto
  });

  // Carica le collezioni che contengono questa frase
  const loadCollectionsForPhrase = async () => {
    if (!collections || !isOpen) return;
    
    try {
      const collectionsWithPhrase = [];
      
      // Per ogni collezione, verifica se contiene la frase corrente
      for (const collection of collections) {
        try {
          const phrasesInCollection = await CollectionService.getPhrasesInCollection(collection.id);
          const phraseExists = phrasesInCollection.some(phrase => phrase.id === phraseId);
          
          if (phraseExists) {
            collectionsWithPhrase.push(collection.id);
          }
        } catch (error) {
          console.error(`Error checking phrases in collection ${collection.id}:`, error);
        }
      }
      
      // Imposta le collezioni selezionate
      setSelectedCollections(collectionsWithPhrase);
    } catch (error) {
      console.error("Error loading collections for phrase:", error);
    }
  };

  // Carica le collezioni quando il modale viene aperto e le collezioni sono disponibili
  useEffect(() => {
    if (isOpen && collections) {
      loadCollectionsForPhrase();
    }
  }, [isOpen, collections]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PhraseFormData>({
    mode: "onBlur",
    defaultValues: {
      text: phraseText || "",
    },
  });

  const currentText = watch("text");

  // Quando i dati della frase vengono caricati, imposta i valori del form
  useEffect(() => {
    if (phraseData) {
      // Imposta il testo della frase
      const translation = phraseData.translations && phraseData.translations.length > 0
        ? phraseData.translations.find(t => t.language_code === i18n.language) || phraseData.translations[0]
        : null;
      
      if (translation) {
        setValue("text", translation.text);
      }

      // Imposta i PECS selezionati
      if (phraseData.pecs_items && phraseData.pecs_items.length > 0) {
        console.log("PECS items nella frase:", phraseData.pecs_items);
        
        // Verifica se pecs_info è definito per ogni item
        phraseData.pecs_items.forEach((item, index) => {
          console.log(`PECS item ${index}:`, item);
          console.log(`PECS info per item ${index}:`, item.pecs_info);
          if (item.pecs_info) {
            console.log(`PECS image_url per item ${index}:`, item.pecs_info.image_url);
          }
        });
        
        const pecsItems = phraseData.pecs_items.map(item => {
          // Se pecs_info è undefined o null, ottieni i dati del PECS direttamente
          if (!item.pecs_info || !item.pecs_info.image_url) {
            console.log(`PECS info mancante per item con pecs_id ${item.pecs_id}, tentativo di recupero diretto...`);
            // Qui potresti fare una chiamata API per ottenere i dati del PECS
            // Per ora, utilizziamo un URL placeholder
            return {
              id: item.pecs_id,
              image_url: `${import.meta.env.VITE_API_URL}/api/v1/phrases/pecs/${item.pecs_id}/image`,
              name: "PECS " + item.position,
              position: item.position,
              origin: (item as any).origin // Preserva il campo origin se presente
            };
          }
          
          return {
            id: item.pecs_id,
            image_url: item.pecs_info.image_url as string,
            name: item.pecs_info.name as string || 'PECS',
            position: item.position,
            origin: (item as any).origin // Preserva il campo origin se presente
          };
        });
        
        console.log("PECS items formattati:", pecsItems);
        setSelectedPecs(pecsItems);
      }

      // Qui potresti anche impostare le collezioni selezionate se hai queste informazioni
    }
  }, [phraseData, setValue, i18n.language]);

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

  // Mutation per aggiornare la frase
  const updatePhraseMutation = useMutation({
    mutationFn: async (data: PhraseFormData) => {
      // Crea l'oggetto di aggiornamento della frase
      const phraseUpdateData = {
        translations: [
          {
            language_code: i18n.language,
            text: data.text,
          }
        ],
        pecs_items: selectedPecs.map((pecs, index) => ({
          pecs_id: pecs.id,
          position: index,
          origin: pecs.origin // Includi il campo origin per ogni PECS
        })),
        origin: data.text // Includi il campo origin anche per la frase
      };
      
      return await PhraseService.updatePhrase(
        phraseId,
        phraseUpdateData
      );
    },
    onSuccess: async (updatedPhrase) => {
      try {
        // Ottieni tutte le collezioni attuali della frase
        const currentCollections: string[] = [];
        
        // Per ogni collezione, verifica se contiene la frase corrente
        if (collections) {
          for (const collection of collections) {
            try {
              const phrasesInCollection = await CollectionService.getPhrasesInCollection(collection.id);
              const phraseExists = phrasesInCollection.some(phrase => phrase.id === phraseId);
              
              if (phraseExists) {
                currentCollections.push(collection.id);
              }
            } catch (error) {
              console.error(`Error checking phrases in collection ${collection.id}:`, error);
            }
          }
        }
        
        // Collezioni da aggiungere (quelle selezionate che non sono nelle collezioni attuali)
        const collectionsToAdd = selectedCollections.filter(id => !currentCollections.includes(id));
        
        // Collezioni da rimuovere (quelle attuali che non sono nelle collezioni selezionate)
        const collectionsToRemove = currentCollections.filter(id => !selectedCollections.includes(id));
        
        // Aggiungi la frase alle nuove collezioni
        for (const collectionId of collectionsToAdd) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/v1/collections/${collectionId}/phrases/${phraseId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
        
        // Rimuovi la frase dalle collezioni non più selezionate
        for (const collectionId of collectionsToRemove) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/v1/collections/${collectionId}/phrases/${phraseId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
        
        showSuccessToast(t("common.success", "Operazione completata con successo"));
      } catch (error) {
        console.error("Errore nell'associazione delle collezioni:", error);
        showSuccessToast(t("phrases.partialSuccess", "Frase aggiornata ma non tutte le collezioni sono state aggiornate"));
      }
      
      reset();
      setSelectedPecs([]);
      setIsOpen(false);
      setSelectedCollections([]);
      
      // Invalida le query
      queryClient.invalidateQueries({ queryKey: ["phrases"] });
      queryClient.invalidateQueries({ queryKey: ["phrase", phraseId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const onSubmit = (data: PhraseFormData) => {
    updatePhraseMutation.mutate(data);
  };

  const handleAddPecs = (pecs: { id: string; image_url: string; name: string }) => {
    console.log("EditPhrase - handleAddPecs - pecs:", pecs);
    console.log("EditPhrase - handleAddPecs - selectedPecs prima:", selectedPecs);
    
    // Aggiungi il nuovo PECS alla fine dell'array esistente
    const newSelectedPecs = [...selectedPecs, { ...pecs, position: selectedPecs.length }];
    console.log("EditPhrase - handleAddPecs - newSelectedPecs dopo:", newSelectedPecs);
    
    setSelectedPecs(newSelectedPecs);
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

  // Funzione per creare una nuova collezione
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setIsCreatingCollection(true);
    try {
      // Ottieni l'ID dell'utente corrente
      const currentUser = queryClient.getQueryData<{ id: string }>(["currentUser"]);
      
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      // Crea la nuova collezione
      const newCollection = await CollectionService.createCollection({
        requestBody: {
          user_id: currentUser.id,
          name_custom: newCollectionName,
          is_custom: true,
          is_visible: true
        }
      });
      
      // Aggiungi la nuova collezione alle collezioni selezionate
      setSelectedCollections(prev => [...prev, newCollection.id]);
      
      // Resetta il form
      setNewCollectionName("");
      setShowNewCollectionForm(false);
      
      // Invalida la query delle collezioni per ricaricare l'elenco
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      
      showSuccessToast(t("phrases.collectionCreated", "Collezione creata con successo"));
    } catch (error) {
      console.error("Errore nella creazione della collezione:", error);
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
        <Button 
          size="sm" 
          colorPalette="blue" 
          variant="ghost"
          aria-label={t("phrases.editPhrase", "Modifica Frase")}
        >
          <FaEdit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        {isLoadingPhrase ? (
          <Box p={4} textAlign="center">
            <Text>{t("common.loading", "Caricamento in corso...")}</Text>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t("phrases.editPhrase", "Modifica Frase")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text mb={4}>{t("phrases.editPhraseDescription", "Modifica la frase e la sequenza di PECS")}</Text>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    {t("phrases.textInputTitle", "1. Inserisci Testo (Opzionale)")}
                  </Text>
                  <Field
                    invalid={!!errors.text}
                    errorText={errors.text?.message}
                  >
                    <Flex>
                      <Textarea
                        id="text"
                        {...register("text")}
                        placeholder={t("phrases.textPlaceholder", "Inserisci il testo e clicca Converti per generare PECS")}
                        rows={2}
                        resize="vertical"
                      />
                      <Button
                        ml={2}
                        size="md"
                        variant="outline"
                        colorScheme="blue"
                        onClick={handleConvertText}
                        loading={isConverting}
                        loadingText={t("phrases.converting", "Converto...")}
                        alignSelf="flex-start"
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
                              fontSize="xs"
                              borderRadius="full"
                              px={2}
                              py={1}
                              m={0.5}
                              cursor="pointer"
                              onClick={() => {
                                setSelectedCollections(prev => 
                                  prev.filter(id => id !== collection.id)
                                );
                              }}
                            >
                              {collection.name_custom}
                              <Box as="span" ml={1}>×</Box>
                            </Badge>
                          ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">
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
                      size="xs" 
                      colorPalette="green" 
                      onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}
                    >
                      <Box as="span" mr={1}>+</Box>
                      {t("phrases.newCollection", "Nuova collezione")}
                    </Button>
                  </Flex>
                  
                  {/* Form per aggiungere una nuova collezione */}
                  {showNewCollectionForm && (
                    <Box mb={3} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        {t("phrases.createNewCollection", "Crea nuova collezione")}
                      </Text>
                      <Flex gap={2} mb={2}>
                        <Input
                          placeholder={t("phrases.collectionName", "Nome collezione")}
                          size="sm"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                        />
                        <Button
                          size="sm"
                          colorPalette="green"
                          disabled={!newCollectionName.trim()}
                          onClick={handleCreateCollection}
                          loading={isCreatingCollection}
                        >
                          {t("common.create", "Crea")}
                        </Button>
                      </Flex>
                    </Box>
                  )}
                  
                  {isLoadingCollections ? (
                    <Text fontSize="sm">Caricamento collezioni...</Text>
                  ) : (
                    <Flex flexWrap="wrap" gap={1}>
                      {collections && collections.length > 0 ? (
                        collections
                          .filter(collection => !selectedCollections.includes(collection.id))
                          .map(collection => (
                            <Badge 
                              key={collection.id} 
                              colorScheme="gray" 
                              variant="outline" 
                              fontSize="xs"
                              borderRadius="full"
                              px={2}
                              py={1}
                              m={0.5}
                              cursor="pointer"
                              onClick={() => {
                                setSelectedCollections(prev => [...prev, collection.id]);
                              }}
                            >
                              {collection.name_custom}
                              <Box as="span" ml={1}>+</Box>
                            </Badge>
                          ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">
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
        )}
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditPhrase;

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  Box,
  Image,
  IconButton as ChakraIconButton,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";

import { type SequenceCreate } from "@/client/types/sequence";
import { SequenceService } from "@/client/services/SequenceService";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
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
import AddPictogramToSequence from "./AddPictogramToSequence";

interface AddSequenceProps {
  groupId: string;
  onClose: () => void;
  triggerButton?: boolean;
}

interface SelectedPictogram {
  id: string;
  image_url: string;
  name: string;
  word?: string;
}

const AddSequence = ({ groupId, onClose, triggerButton = true }: AddSequenceProps) => {
  const [isOpen, setIsOpen] = useState(!triggerButton);
  const [selectedPictograms, setSelectedPictograms] = useState<SelectedPictogram[]>([]);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SequenceCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      display_order: 0,
      is_favorite: false,
      group_id: groupId,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SequenceCreate) =>
      SequenceService.createSequence({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Sequenza creata con successo.");
      reset();
      setSelectedPictograms([]);
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
    },
  });

  const onSubmit: SubmitHandler<SequenceCreate> = (data) => {
    const items = selectedPictograms.map((pic, index) => ({
      pictogram_id: pic.id,
      position: index,
      word: pic.word || pic.name, // Utilizziamo la parola dal pittogramma o il nome come fallback
      url: pic.image_url, // Aggiungiamo l'URL dell'immagine
    }));
    
    mutation.mutate({
      ...data,
      items,
    });
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedPictograms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedPictograms(items);
  }, [selectedPictograms]);

  const addPictogram = useCallback((pictogram: SelectedPictogram) => {
    // Aggiungiamo il pittogramma alla lista
    setSelectedPictograms(prev => [...prev, pictogram]);
    // Mostriamo un toast di conferma
    showSuccessToast(`Pittogramma "${pictogram.name}" aggiunto alla sequenza`);
    
    // Importante: manteniamo il dialog aperto
    setIsOpen(true);
  }, [showSuccessToast]);

  const removePictogram = useCallback((index: number) => {
    setSelectedPictograms(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => {
        // Se stiamo chiudendo il dialog, chiamiamo onClose
        if (!open) {
          onClose();
        }
        // Altrimenti, aggiorniamo lo stato
        setIsOpen(open);
      }}
    >
      {triggerButton && (
        <DialogTrigger asChild>
          <Button variant="ghost">
            <FaPlus fontSize="16px" />
            Aggiungi Sequenza
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={(e) => {
          // Preveniamo la propagazione dell'evento per evitare che il dialog si chiuda
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}>
          <DialogHeader>
            <DialogTitle>Aggiungi Sequenza</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Inserisci i dettagli per aggiungere una nuova sequenza.</Text>
            <Box display="flex" flexDirection="column" gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Nome"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Il nome è obbligatorio.",
                  })}
                  placeholder="Nome"
                  type="text"
                />
              </Field>

              <Box>
                <Text fontWeight="medium" mb={2}>Pittogrammi Selezionati</Text>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="pictograms">
                    {(provided: any) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        minH="100px"
                        bg="gray.50"
                        p={2}
                        borderRadius="md"
                      >
                        {selectedPictograms.map((pictogram, index) => (
                          <Draggable
                            key={pictogram.id}
                            draggableId={pictogram.id}
                            index={index}
                          >
                            {(provided: any) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                display="flex"
                                alignItems="center"
                                bg="white"
                                p={2}
                                borderRadius="md"
                                boxShadow="sm"
                              >
                                <Box {...provided.dragHandleProps}>
                                  <FaGripVertical />
                                </Box>
                                <Image
                                  src={pictogram.image_url}
                                  alt={pictogram.name}
                                  boxSize="40px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  ml={2}
                                />
                                <Text flex={1} ml={2}>{pictogram.name}</Text>
                                <ChakraIconButton
                                  aria-label="Remove pictogram"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removePictogram(index)}
                                >
                                  <FaTrash />
                                </ChakraIconButton>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>

              <Box
                onClick={(e) => {
                  // Fermiamo la propagazione dell'evento per evitare che il dialog padre si chiuda
                  e.stopPropagation();
                }}
              >
                <AddPictogramToSequence
                  sequenceId={groupId}
                  onPictogramSelected={addPictogram}
                />
              </Box>
            </Box>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="ghost"
                disabled={isSubmitting}
              >
                Annulla
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Salva
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddSequence;

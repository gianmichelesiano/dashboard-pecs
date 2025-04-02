import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Flex,
  Heading,
  Text,
  Box,
  EmptyState,
  IconButton as ChakraIconButton,
} from "@chakra-ui/react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { SequenceService } from "../../client/services/SequenceService";
import type { SequenceGroupRead } from "../../client/types/sequence";
import AddSequence from "./AddSequence";
import {
  DrawerRoot,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "../ui/drawer";
import { Button } from "../ui/button";

interface SequencesListProps {
  isOpen: boolean;
  onClose: () => void;
  group: SequenceGroupRead;
}

const SequencesList = ({ isOpen, onClose, group }: SequencesListProps) => {
  const [isAddingSequence, setIsAddingSequence] = useState(false);

  // Fetch sequences for this group
  const { data: sequences, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["sequences", { groupId: group.id }],
    queryFn: async () => {
      try {
        console.log("Fetching sequences for group:", group.id);
        const result = await SequenceService.readSequences({ group_id: group.id });
        console.log("Sequences result:", result);
        return result;
      } catch (err) {
        console.error("Error fetching sequences:", err);
        throw err;
      }
    },
  });

  const handleAddSequenceClose = () => {
    setIsAddingSequence(false);
    refetch();
  };

  return (
    <DrawerRoot
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      size="md"
      placement="end"
    >
      <DrawerContent>
        <DrawerCloseTrigger />
        <DrawerHeader borderBottomWidth="1px">
          <Heading size="md">Sequenze: {group.name}</Heading>
        </DrawerHeader>

        <DrawerBody>
          {isLoading ? (
            <Text>Caricamento in corso...</Text>
          ) : isError ? (
            <Box p={4} bg="red.50" color="red.600" borderRadius="md">
              <Text fontWeight="bold">Errore nel caricamento delle sequenze</Text>
              <Text mt={2}>Si è verificato un errore durante il caricamento delle sequenze. Riprova più tardi.</Text>
              <Text mt={2} fontSize="sm" fontFamily="monospace">
                {error instanceof Error ? error.message : "Errore sconosciuto"}
              </Text>
              <Button mt={4} onClick={() => refetch()} size="sm">
                Riprova
              </Button>
            </Box>
          ) : sequences && sequences.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={4} mt={4}>
              {sequences.map((sequence) => (
                <Box
                  key={sequence.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">{sequence.name}</Text>
                    <Box display="flex" gap={2}>
                      <ChakraIconButton
                        aria-label="Modifica sequenza"
                        size="sm"
                        variant="ghost"
                      >
                        <FaEdit />
                      </ChakraIconButton>
                      <ChakraIconButton
                        aria-label="Elimina sequenza"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                      >
                        <FaTrash />
                      </ChakraIconButton>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <FiSearch />
                </EmptyState.Indicator>
                <Box textAlign="center" display="flex" flexDirection="column" gap={2}>
                  <EmptyState.Title>Nessuna sequenza trovata</EmptyState.Title>
                  <EmptyState.Description>
                    Aggiungi una nuova sequenza per iniziare
                  </EmptyState.Description>
                </Box>
              </EmptyState.Content>
            </EmptyState.Root>
          )}

          {isAddingSequence && (
            <AddSequence
              groupId={group.id}
              onClose={handleAddSequenceClose}
              triggerButton={false}
            />
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Chiudi
          </Button>
          <Button
            colorScheme="teal"
            onClick={() => setIsAddingSequence(true)}
          >
            <FaPlus style={{ marginRight: "8px" }} />
            Aggiungi Sequenza
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default SequencesList;
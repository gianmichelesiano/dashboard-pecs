// React è importato automaticamente con JSX

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaExchangeAlt } from "react-icons/fa";
import { Button, DialogTitle, Text, Box, VStack } from "@chakra-ui/react";

import { CategoryResponse } from '../../client/types/category';
// ... existing code ...

import { PictogramService } from "../../client/services/PictogramService";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import useCustomToast from "../../hooks/useCustomToast";

const ShowCategory = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showErrorToast } = useCustomToast();

  // Sostituiamo useMutation con useQuery perché stiamo leggendo dati
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => PictogramService.showCategory({ pecsId: id }),
    enabled: isOpen, // La query viene eseguita solo quando il dialog è aperto
  });

  return (

    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      role="alertdialog"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FaExchangeAlt fontSize="16px" />
          Mostra Categorie
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Categorie Pittogramma</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text mb={4}>
            Queste sono tutte le categorie associate al pittogramma:
          </Text>
          
          {isLoading ? (
            <Text>Caricamento categorie...</Text>
          ) : (
            // SOSTITUISCI QUESTO BLOCCO
            <VStack  align="stretch">
              {categories?.map((category: CategoryResponse[number]) => (
                <Box key={category.id} p={3} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="bold">
                    {category.translations.find(t => t.language_code === 'it')?.name || 
                     category.translations.find(t => t.language_code === 'en')?.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {category.translations.map(t => (
                      `${t.language_code}: ${t.name}`
                    )).join(' | ')}
                  </Text>
                </Box>
              ))}
            </VStack>
            // FINO A QUI
          )}
        </DialogBody>

        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button
              variant="subtle"
              colorPalette="gray"
              onClick={() => setIsOpen(false)}
            >
              Chiudi
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
    

  );
};

export default ShowCategory;


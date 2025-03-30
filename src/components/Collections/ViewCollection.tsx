import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  DialogTitle,
  IconButton,
  Text,
  Box,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";

import { CollectionService } from "../../client/services/CollectionService";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
import type { CollectionRead, PhraseRead } from "../../client/types.gen";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";

interface ViewCollectionProps {
  collection: CollectionRead;
}

const ViewCollection = ({ collection }: ViewCollectionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  const { data: phrases, isLoading } = useQuery({
    queryKey: ["collection-phrases", collection.id],
    queryFn: () => CollectionService.getPhrasesInCollection(collection.id),
    enabled: isOpen,
  });

  return (
    <DialogRoot
      size="xl"
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <IconButton
          aria-label={t("collections.viewCollection", "Visualizza collezione")}
          size="sm"
          value="view-collection"
        >
          <FiFolder />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Flex alignItems="center">
              <Box 
                bg={collection.color || "blue.500"} 
                w="24px" 
                h="24px" 
                borderRadius="md" 
                mr={2}
              />
              {collection.name_custom || t("collections.untitled", "Collezione")}
            </Flex>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Heading size="sm" mb={4}>{t("collections.phrasesInCollection", "Frasi nella collezione")}</Heading>
          
          {isLoading ? (
            <Box textAlign="center" py={4}>{t("common.loading", "Caricamento in corso...")}</Box>
          ) : !phrases || phrases.length === 0 ? (
            <Box textAlign="center" py={4}>{t("collections.noPhrases", "Nessuna frase in questa collezione")}</Box>
          ) : (
            <Box>
              {phrases.map((phrase: PhraseRead) => {
                const translation = phrase.translations && phrase.translations.length > 0
                  ? phrase.translations[0]
                  : null;
                
                return (
                  <Box 
                    key={phrase.id} 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    mb={2}
                  >
                    <Box fontWeight="medium">
                      {translation ? translation.text : t("phrases.noText", "Nessun testo")}
                    </Box>
                    
                    {phrase.pecs_items && phrase.pecs_items.length > 0 && (
                      <Flex mt={2} gap={2}>
                        {phrase.pecs_items.map((item) => (
                          <img 
                            key={item.pecs_id}
                            src={item.pecs_info?.image_url as string || ''}
                            alt={item.pecs_info?.name as string || ''}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'contain',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px'
                            }}
                          />
                        ))}
                      </Flex>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogBody>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} colorPalette="green">
            {t("common.close", "Chiudi")}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ViewCollection;

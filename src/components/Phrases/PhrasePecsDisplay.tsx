import React from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  HStack,
  VStack,
  Center,
} from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown, FaTrash, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface PhrasePecsDisplayProps {
  pecs: Array<{
    id: string;
    image_url: string;
    name: string;
    position: number;
    origin?: string;  // Campo opzionale per il testo originale
  }>;
  onRemove: (index: number) => void;
  onReorder: (newOrder: Array<{
    id: string;
    image_url: string;
    name: string;
    position: number;
    origin?: string;
  }>) => void;
}

const PhrasePecsDisplay = ({ pecs, onRemove, onReorder }: PhrasePecsDisplayProps) => {
  const { t } = useTranslation();
  
  console.log("PhrasePecsDisplay - pecs:", pecs);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPecs = [...pecs];
    [newPecs[index - 1], newPecs[index]] = [newPecs[index], newPecs[index - 1]];
    onReorder(newPecs);
  };

  const moveDown = (index: number) => {
    if (index === pecs.length - 1) return;
    const newPecs = [...pecs];
    [newPecs[index], newPecs[index + 1]] = [newPecs[index + 1], newPecs[index]];
    onReorder(newPecs);
  };

  if (pecs.length === 0) {
    return (
      <Center p={4} borderWidth="1px" borderStyle="dashed" borderRadius="md">
        <Text color="gray.500">{t("phrases.noPecsSelected", "Nessun PECS selezionato")}</Text>
      </Center>
    );
  }

  return (
    <Flex overflowX="auto" pb={2}>
      <HStack gap={4} minHeight="150px">
        {pecs.map((pec, index) => (
          <Box key={`${pec.id}-${index}`} position="relative" w="100px">
            <VStack gap={1}>
              {pec.origin && (
                <Text fontSize="xs" fontWeight="bold" textAlign="center" color="blue.600">
                  {pec.origin.length > 15 ? pec.origin.substring(0, 15) + '...' : pec.origin}
                </Text>
              )}
              <Image
                src={pec.image_url}
                alt={pec.name}
                boxSize="80px"
                objectFit="contain"
                borderWidth="1px"
                borderRadius="md"
                p={1}
              />
              <Text fontSize="sm" textAlign="center">
                {pec.name.length > 15 ? pec.name.substring(0, 15) + '...' : pec.name}
              </Text>
              <HStack gap={1}>
                <Button
                  aria-label="Move up"
                  size="2xs"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                >
                  <FaArrowLeft size={8} />
                </Button>
                <Button
                  aria-label="Move down"
                  size="2xs"
                  disabled={index === pecs.length - 1}
                  onClick={() => moveDown(index)}
                >
                  <FaArrowRight size={8} />
                </Button>
                <Button
                  aria-label="Remove"
                  size="2xs"
                  colorPalette="red"
                  onClick={() => onRemove(index)}
                >
                  <FaTrash size={8} />
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </HStack>
    </Flex>
  );
};

export default PhrasePecsDisplay;

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Text, Flex, Badge, Tooltip } from "@chakra-ui/react";

import { CollectionService } from "../../client/services/CollectionService";

interface PhraseCollectionsProps {
  phraseId: string;
}

const PhraseCollections = ({ phraseId }: PhraseCollectionsProps): JSX.Element => {
  const [collections, setCollections] = useState<{
    id: string;
    name: string;
  }[]>([]);
  
  // Query per ottenere tutte le collezioni
  const { data: allCollections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => CollectionService.getAllCollections(0, 1000),
  });

  // Carica le collezioni che contengono questa frase
  useEffect(() => {
    const loadCollectionsForPhrase = async () => {
      if (!allCollections) return;
      
      try {
        const collectionsWithPhrase: { id: string; name: string; }[] = [];
        
        // Per ogni collezione, verifica se contiene la frase corrente
        for (const collection of allCollections) {
          try {
            const phrasesInCollection = await CollectionService.getPhrasesInCollection(collection.id);
            const phraseExists = phrasesInCollection.some(phrase => phrase.id === phraseId);
            
            if (phraseExists) {
              collectionsWithPhrase.push({
                id: collection.id,
                name: collection.name_custom || "Collezione senza nome"
              });
            }
          } catch (error) {
            console.error(`Error checking phrases in collection ${collection.id}:`, error);
          }
        }
        
        // Imposta le collezioni
        setCollections(collectionsWithPhrase);
      } catch (error) {
        console.error("Error loading collections for phrase:", error);
      }
    };

    loadCollectionsForPhrase();
  }, [allCollections, phraseId]);

  if (isLoading) {
    return <Text fontSize="sm">Caricamento...</Text>;
  }

  if (collections.length === 0) {
    return <Text fontSize="sm">Nessuna collezione</Text>;
  }

  // Mostra tutte le collezioni come bubble labels
  return (
    <Flex flexWrap="wrap" gap={1}>
      {collections.map(collection => (
        <Badge 
          key={collection.id} 
          colorScheme="blue" 
          variant="solid" 
          fontSize="xs"
          borderRadius="full"
          px={2}
          py={1}
          m={0.5}
        >
          {collection.name}
        </Badge>
      ))}
    </Flex>
  );
};

export default PhraseCollections;

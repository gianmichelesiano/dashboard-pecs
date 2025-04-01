// React è importato automaticamente con JSX
import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Image,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";


import { CategoryService } from "../../client/services/CategoryService";
import AddPictogram from "../../components/Pictograms/AddPictogram";
import { PictogramActionsMenu } from "../../components/Common/PictogramActionsMenu";

// Define a type for the PECS response from the API
type PecsItem = {
  image_url: string;
  is_custom: boolean;
  name_custom?: string;
  id: string;
  created_at: string;
  user_id: string;
  translations: Array<{
    language_code: string;
    name: string;
    id: string;
    pecs_id: string;
  }>;
};

const categoryPictogramsSearchSchema = z.object({
  categoryId: z.string(),
  language: z.string().catch("it"), // Add language parameter with default "it"
});

// No limit per page, show all PECS
function getPictogramsQueryOptions({ categoryId }: { categoryId: string; page?: number }) {
  return {
    queryFn: () =>
      CategoryService.readCategoryPecs({
        id: categoryId,
        // No skip or limit to get all PECS
      }),
    queryKey: ["categoryPecs", { categoryId }],
  };
}

function getCategoryQueryOptions({ categoryId }: { categoryId: string }) {
  return {
    queryFn: () => CategoryService.readCategory({ id: categoryId }),
    queryKey: ["category", categoryId],
  };
}

export const Route = createFileRoute("/_layout/category-pictograms")({
  component: CategoryPictogramsPage,
  validateSearch: (search) => categoryPictogramsSearchSchema.parse(search),
});

function PictogramsGrid() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { categoryId, language } = Route.useSearch();

  const { isLoading: isCategoryLoading } = useQuery({
    ...getCategoryQueryOptions({ categoryId }),
  });

  const { data: pictogramsData, isLoading: isPictogramsLoading } = useQuery({
    ...getPictogramsQueryOptions({ categoryId }),
    placeholderData: (prevData) => prevData,
  });

  console.log("Raw pictograms data:", pictogramsData);
  
  // Gestisci sia il caso in cui pictogramsData è un array che il caso in cui ha una proprietà data
  let allPictograms = Array.isArray(pictogramsData) 
    ? pictogramsData 
    : (pictogramsData?.data ?? []);
    
  // Filter pictograms to include those with a translation in the selected language OR custom pictograms
  const pictograms = allPictograms.filter((pecs: PecsItem) => 
    pecs.is_custom === true || 
    pecs.translations.some((t: { language_code: string }) => t.language_code === language)
  );
  
  console.log("Pictograms data:", pictograms);
  console.log("Pictograms count:", pictograms.length);

  if (isCategoryLoading || isPictogramsLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (pictograms.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Nessun pittogramma in questa categoria</EmptyState.Title>
            <EmptyState.Description>
              Aggiungi un nuovo pittogramma per iniziare
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
      {pictograms.map((pecs: PecsItem) => {
        // Find translation in the selected language
        const translation = pecs.translations.find(t => t.language_code === language) || pecs.translations[0];
        
        return (
          <div key={pecs.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src={pecs.image_url}
              alt={translation?.name || (pecs.is_custom ? (pecs.name_custom || "Immagine") : "Immagine")}
              boxSize="120px"
              objectFit="contain"
              mb={3}
              onError={(e) => {
                // Utilizzo di placehold.co invece di via.placeholder.com
                e.currentTarget.src = "https://placehold.co/120x120/e2e8f0/718096?text=Immagine+non+disponibile";
              }}
            />
            <Heading size="sm" mb={2}>{translation?.name || (pecs.is_custom ? (pecs.name_custom || "Senza nome") : "Senza nome")}</Heading>
            {/* Show language badge if translation is not in the selected language */}
            {translation && translation.language_code !== language && (
              <Badge 
                colorPalette="yellow" 
                variant="subtle" 
                mb={2}
              >
                {translation.language_code.toUpperCase()}
              </Badge>
            )}
            {/* Convert PECS to PictogramPublic format for the actions menu */}
            <PictogramActionsMenu pictogram={{
              id: pecs.id,
              word: translation?.name || (pecs.is_custom ? (pecs.name_custom || "") : ""),
              image_url: pecs.image_url,
              is_custom: pecs.is_custom,
              created_by: pecs.user_id,
              category_ids: []
            }} />
          </div>
        );
      })}
    </div>
  );
}

function CategoryPictogramsPage() {
  const { categoryId, language } = Route.useSearch();
  const { data: categoryData, isLoading } = useQuery({
    ...getCategoryQueryOptions({ categoryId }),
  });

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  const categoryName = categoryData?.name || "Categoria";

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" pt={12}>
        <Heading size="lg">
          Pittogrammi: {categoryName} ({language.toUpperCase()})
        </Heading>
        <Link
          to="/categories-by-language"
          style={{
            padding: '8px 16px',
            backgroundColor: '#718096',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Torna alle Categorie
        </Link>
      </Flex>
      <AddPictogram categoryId={categoryId} />
      <PictogramsGrid />
    </Container>
  );
}

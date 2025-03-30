import {
  Container,
  EmptyState,
  Flex,
  Heading,
  VStack,
  Box,
  Text,
  Stack,
  Input,
  Badge,
  InputElement,
  IconButton as ChakraIconButton,
} from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FiSearch, FiEdit, FiTrash2, FiExternalLink } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import { CategoryService } from "@/client/services/CategoryService";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import AddCategory from "@/components/Categories/AddCategory";

const categoriesByLanguageSearchSchema = z.object({
  page: z.number().catch(1),
  language: z.string().catch("it"),
  search: z.string().optional(),
});

const PER_PAGE = 5;

function getCategoriesByLanguageQueryOptions({
  page,
  language,
}: {
  page: number;
  language: string;
}) {
  return {
    queryFn: () => CategoryService.readCategoriesByLanguage({ code: language }),
    queryKey: ["categoriesByLanguage", { page, language }],
  };
}

export const Route = createFileRoute("/_layout/categories-by-language")({
  component: CategoriesByLanguage,
  validateSearch: (search) => categoriesByLanguageSearchSchema.parse(search),
});

// Language badge component
const LanguageBadge = ({ code, active = false, onClick }: { code: string; active?: boolean; onClick?: () => void }) => {
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      colorPalette={active ? "blue" : "gray"}
      variant={active ? "solid" : "subtle"}
      cursor="pointer"
      onClick={onClick}
      mx={1}
    >
      {code.toUpperCase()}
    </Badge>
  );
};

// Type badge component
const TypeBadge = ({ type }: { type: "Primaria" | "Secondaria" }) => {
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      colorPalette={type === "Primaria" ? "green" : "blue"}
      variant="subtle"
    >
      {type}
    </Badge>
  );
};

function CategoriesByLanguageTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page, language, search } = Route.useSearch();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(search || "");

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getCategoriesByLanguageQueryOptions({ page, language }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: any) => ({ ...prev, page }),
    });

  const setLanguage = (language: string) =>
    navigate({
      search: (prev: any) => ({ ...prev, language }),
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev: any) => ({ ...prev, search: searchTerm, page: 1 }),
    });
  };

  const categories = data || [];
  
  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? categories.filter((category) =>
        category.translations.some((t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : categories;
  
  const count = filteredCategories.length;
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (categories.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Non ci sono categorie per questa lingua</EmptyState.Title>
            <EmptyState.Description>
              Prova a selezionare un'altra lingua
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <form onSubmit={handleSearch}>
        <InputGroup mb={6} mt={4} startElement={<FiSearch />}>
          <Input
            placeholder="Cerca categorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="full"
          />
        </InputGroup>
      </form>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "500" }}>NOME</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "500" }}>TIPO</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "500" }}>PECS</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "500" }}>LINGUE</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "500" }}>AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories?.map((category) => {
              // Determine if category is primary or secondary
              const isPrimary = !category.parent_id;
              const type = isPrimary ? "Primaria" : "Secondaria";
              
              // Get category name in current language
              const currentTranslation = category.translations.find(
                (t) => t.language_code === language
              );
              
              // Get available languages
              const availableLanguages = category.translations.map(t => t.language_code);
              
              return (
                <tr
                  key={category.id}
                  style={{ 
                    opacity: isPlaceholderData ? 0.5 : 1,
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <td style={{ padding: "16px" }}>
                    <Flex alignItems="center">
                      <Box 
                        mr={4} 
                        borderRadius="full" 
                        w="40px" 
                        h="40px" 
                        bg={isPrimary ? "blue.100" : "red.100"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Checkbox colorPalette="blue" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold">{currentTranslation?.name || "N/A"}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {isPrimary ? "Categoria principale" : `Sottocategoria di ${category.parent_id}`}
                        </Text>
                      </Box>
                    </Flex>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <TypeBadge type={type} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Flex alignItems="center">
                      <Link
                        to="/category-pictograms"
                        search={{ categoryId: category.id, language }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#4299E1',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        <FiExternalLink style={{ marginRight: '4px' }} />
                        lista pecs
                      </Link>
                    </Flex>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Flex>
                      {["it", "en", "es", "fr", "de"].map(lang => (
                        availableLanguages.includes(lang) && (
                          <LanguageBadge 
                            key={lang} 
                            code={lang} 
                            active={lang === language}
                            onClick={() => setLanguage(lang)}
                          />
                        )
                      ))}
                    </Flex>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Flex>
                      <ChakraIconButton 
                        aria-label="Edit" 
                        size="sm" 
                        variant="ghost" 
                        mr={2}
                      >
                        <FiEdit />
                      </ChakraIconButton>
                      <ChakraIconButton 
                        aria-label="Delete" 
                        size="sm" 
                        variant="ghost" 
                        colorPalette="red"
                      >
                        <FiTrash2 />
                      </ChakraIconButton>
                    </Flex>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function CategoriesByLanguage() {
  return (
    <Container maxW="full" px={6}>
      <Flex justifyContent="space-between" alignItems="center" pt={12} pb={4}>
        <Heading size="lg">Categorie</Heading>
        <AddCategory />
      </Flex>
      <Box 
        bg="white" 
        borderRadius="lg" 
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
      >
        <CategoriesByLanguageTable />
      </Box>
    </Container>
  );
}

import React from "react";
import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { CategoryService } from "@/client/services/CategoryService";
import { CategoryActionsMenu } from "@/components/Common/CategoryActionsMenu";
import AddCategory from "@/components/Categories/AddCategory";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";

const categoriesSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getCategoriesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      CategoryService.readCategories({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["categories", { page }],
  };
}

export const Route = createFileRoute("/_layout/categories")({
  component: Categories,
  validateSearch: (search) => categoriesSearchSchema.parse(search),
});

function CategoriesTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getCategoriesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  console.log("Raw data from API:", data);
  
  // Verifica se data è un array o ha una proprietà data
  const categories = Array.isArray(data)
    ? data.slice(0, PER_PAGE)
    : (data?.data?.slice(0, PER_PAGE) ?? []);
  
  // Verifica se count esiste o usa la lunghezza dell'array
  const count = data?.count ?? (Array.isArray(data) ? data.length : 0);
  
  console.log("Categories data:", categories);
  console.log("Categories count:", count);

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
            <EmptyState.Title>Non hai ancora categorie</EmptyState.Title>
            <EmptyState.Description>
              Aggiungi una nuova categoria per iniziare
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Colore</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Icona</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.id} style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
                <td style={{ padding: '8px' }}>
                  {category.name}
                </td>
                <td style={{ padding: '8px' }}>
                  <div
                    style={{
                      backgroundColor: category.color,
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  {category.icon === "" ? "(Nessuna icona)" : category.icon}
                </td>
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to="/category-pictograms"
                      search={{ categoryId: category.id }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4299E1',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textDecoration: 'none'
                      }}
                    >
                      Pittogrammi
                    </Link>
                    <CategoryActionsMenu category={category} />
                  </div>
                </td>
              </tr>
            ))}
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

function Categories() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Gestione Categorie
      </Heading>
      <AddCategory />
      <CategoriesTable />
    </Container>
  );
}
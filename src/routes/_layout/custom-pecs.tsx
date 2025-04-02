import React from "react"
import { useTranslation } from "react-i18next"
import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiImage } from "react-icons/fi"
import { z } from "zod"

import { PecsService } from "../../client/sdk.gen"
import type { PecsPublic } from "../../client/types/pecs"
import AddCustomPecs from "../../components/CustomPecs/AddCustomPecs"
import DeleteCustomPecs from "../../components/CustomPecs/DeleteCustomPecs"
import PendingItems from "../../components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination"

const customPecsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getCustomPecsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      PecsService.getCustomPecs({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["custom-pecs", { page }],
  }
}

export const Route = createFileRoute("/_layout/custom-pecs")({
  component: CustomPecs,
  validateSearch: (search) => customPecsSearchSchema.parse(search),
})

function CustomPecsTable() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getCustomPecsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  // Utilizziamo any per evitare problemi di tipo tra PECSRead e PecsPublic
  const customPecs = (data as any)?.slice(0, PER_PAGE) ?? []
  const count = customPecs.length

  if (isLoading) {
    return <PendingItems />
  }

  if (customPecs.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiImage />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>{t("customPecs.noCustomPecs")}</EmptyState.Title>
            <EmptyState.Description>
              {t("customPecs.noCustomPecsDescription")}
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">{t("customPecs.name")}</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">{t("customPecs.image")}</Table.ColumnHeader>
           
            <Table.ColumnHeader w="sm">{t("customPecs.actions")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {customPecs?.map((pecs: any) => (
            <Table.Row key={pecs.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {pecs.name_custom || "N/A"}
              </Table.Cell>
              <Table.Cell>
                <img 
                  src={pecs.image_url} 
                  alt={pecs.name_custom || "Custom PECS"} 
                  style={{ width: "50px", height: "50px", objectFit: "contain" }}
                />
              </Table.Cell>
 
              <Table.Cell>
                <DeleteCustomPecs id={pecs.id} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
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
  )
}

function CustomPecs() {
  const { t } = useTranslation()
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        {t("customPecs.title")}
      </Heading>
      <AddCustomPecs />
      <CustomPecsTable />
    </Container>
  )
}

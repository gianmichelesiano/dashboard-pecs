import { Container, Heading, Stack } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import React from "react"
import { useTranslation } from "react-i18next"

import { UsersService } from "@/client/sdk.gen"
import { Radio, RadioGroup } from "../../components/ui/radio"
import useCustomToast from "@/hooks/useCustomToast"

const ChangeLanguage = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const updateLanguageMutation = useMutation({
    mutationFn: (language: string) => {
      return UsersService.updateUserMe({
        requestBody: {
          lang: language
        }
      })
    },
    onSuccess: () => {
      showSuccessToast(t('common.success'))
    },
    onError: (error) => {
      showErrorToast(error instanceof Error ? error.message : String(error))
    }
  })

  const handleLanguageChange = (language: string) => {
    // Update i18n language
    i18n.changeLanguage(language)
    
    // Update user's language preference in the backend
    updateLanguageMutation.mutate(language)
  }

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          {t('languages.changeLanguage')}
        </Heading>

        <RadioGroup
          onChange={(e: React.FormEvent<HTMLDivElement>) => handleLanguageChange((e.target as HTMLInputElement).value)}
          value={currentLanguage}
          colorPalette="teal"
        >
          <Stack>
            <Radio value="en">{t('languages.en')}</Radio>
            <Radio value="fr">{t('languages.fr')}</Radio>
            <Radio value="it">{t('languages.it')}</Radio>
            <Radio value="de">{t('languages.de')}</Radio>
            <Radio value="es">{t('languages.es')}</Radio>
          </Stack>
        </RadioGroup>
      </Container>
    </>
  )
}

export default ChangeLanguage

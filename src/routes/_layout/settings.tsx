import { Container, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import Appearance from "@/components/UserSettings/Appearance"
import ChangeLanguage from "@/components/UserSettings/ChangeLanguage"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  
  const tabsConfig = [
    { value: "my-profile", title: t('common.myProfile'), component: UserInformation },
    { value: "password", title: t('common.password'), component: ChangePassword },
    { value: "appearance", title: t('common.appearance'), component: Appearance },
    { value: "language", title: t('common.language'), component: ChangeLanguage },
    { value: "danger-zone", title: t('common.dangerZone'), component: DeleteAccount },
  ]

  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 4) // Include language tab (index 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        {t('common.userSettings')}
      </Heading>

      <Tabs.Root defaultValue="my-profile" variant="subtle">
        <Tabs.List>
          {finalTabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {finalTabs.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            <tab.component />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}

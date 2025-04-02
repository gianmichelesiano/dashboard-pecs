import React from "react"
import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { PecsPublic } from "../../client/types/pecs"
import DeleteCustomPecs from "./DeleteCustomPecs"
import EditCustomPecs from "./EditCustomPecs"

interface CustomPecsActionsMenuProps {
  pecs: PecsPublic
}

const CustomPecsActionsMenu = ({ pecs }: CustomPecsActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" aria-label="Menu">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditCustomPecs pecs={pecs} />
        <DeleteCustomPecs id={pecs.id} />
      </MenuContent>
    </MenuRoot>
  )
}

export default CustomPecsActionsMenu

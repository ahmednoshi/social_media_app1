import { RoleEnum } from "../../DB/models/user.model";



export const endPoint = {
    profile:[RoleEnum.user],
    dashBorad:[RoleEnum.admin,RoleEnum.superAdmin]
}
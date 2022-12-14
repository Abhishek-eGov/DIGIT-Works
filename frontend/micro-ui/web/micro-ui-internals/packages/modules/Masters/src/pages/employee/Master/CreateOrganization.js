import React, { useState } from 'react'
import { Header } from '@egovernments/digit-ui-react-components'
import { useTranslation } from 'react-i18next'
import CreateOrganizationForm from '../../../components/CreateOrganization/CreateOrganizationForm'
import CreateOrganizationSuccess from '../../../components/CreateOrganization/CreateOrganizationSuccess'

const CreateOrganization = ({parentRoute}) => {
  const { t } = useTranslation()
  const [createOrgStatus, setCreateOrgStatus] = useState(null)

  return (
    <React.Fragment>
       {createOrgStatus === null ? 
        (
          <React.Fragment>
            <Header>{t("MASTERS_CREATE_ORGANISATION")}</Header>
            <CreateOrganizationForm setCreateOrgStatus={setCreateOrgStatus}/>
          </React.Fragment>
        ) :
        <CreateOrganizationSuccess isSuccess={createOrgStatus} setCreateOrgStatus={setCreateOrgStatus}/> 
       } 
    </React.Fragment>
  )
}

export default CreateOrganization;
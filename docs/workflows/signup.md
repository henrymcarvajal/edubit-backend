```mermaid
    flowchart TD
        Start(Inicio) --> A["`Captura de datos básicos, incluye actividades personales`"]
        A --> B["Selección de institución"]
        B --> C["Selección de talleres en institución"]
        C --> D["Selección de actividades habilitadas en taller"]
        D --> E["Registrar participante"]
        E --> Stop(Fin)
```

En su orden los endpoints son:

- Get all institutions ([curl](../api_specs/admin_api.md#Get-all-institutions))
- Sign up participant ([curl](../api_specs/users_api.md#Sign-up-participant))
- Update participant ([curl](../api_specs/members_api.md#Update-participant))
- Get workshop execution by institution id ([curl](../api_specs/workshops_api.md#Get-execution-by-institution-id))
- Enroll participant ([curl](../api_specs/workshops_api.md#Enroll-participant))


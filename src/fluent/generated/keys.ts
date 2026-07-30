import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'b244e144f88e4f9faec902ed4d5d85ae'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '2eecee46c14c4d65bc53a45afe7b119b'
                    }
                }
            }
        }
    }
}

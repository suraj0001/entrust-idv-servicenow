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
                    br0: {
                        table: 'sys_script'
                        id: '4337d190a4b14253835926bde3911477'
                    }
                    cs0: {
                        table: 'sys_script_client'
                        id: 'dc26586909924c90a966f0af47888fc2'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '2eecee46c14c4d65bc53a45afe7b119b'
                    }
                    src_server_script_ts: {
                        table: 'sys_module'
                        id: '7783369edf86402b96193b992857021d'
                    }
                }
            }
        }
    }
}

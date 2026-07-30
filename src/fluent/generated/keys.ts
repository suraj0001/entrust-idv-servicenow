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
                    'entrust-setup-ajax-si': {
                        table: 'sys_script_include'
                        id: '3fcd30784fcc48f991b8bab7e1daf362'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '2eecee46c14c4d65bc53a45afe7b119b'
                    }
                    'src_server_script-includes_EntrustSetupAjax_js': {
                        table: 'sys_module'
                        id: '58a2a2edd7ad4b5c92fac5508f170583'
                    }
                    'src_server_setup_entrust-setup_ts': {
                        table: 'sys_module'
                        id: '2ab0663c5adc427d960caa451766b53c'
                    }
                }
            }
        }
    }
}

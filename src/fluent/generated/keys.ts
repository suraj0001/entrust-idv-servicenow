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
                    'src_server_js_entrust-idv-setup-client_js': {
                        table: 'sys_module'
                        id: '3fbbf828991747a78b3de31b979fa079'
                        deleted: true
                    }
                    src_server_js_EntrustSetupAjax_js: {
                        table: 'sys_module'
                        id: '812ac2a8661d4e089949f6cadab00270'
                        deleted: true
                    }
                    'src_server_script-includes_EntrustSetupAjax_js': {
                        table: 'sys_module'
                        id: '58a2a2edd7ad4b5c92fac5508f170583'
                        deleted: true
                    }
                    'src_server_setup_entrust-setup_ts': {
                        table: 'sys_module'
                        id: '2ab0663c5adc427d960caa451766b53c'
                        deleted: true
                    }
                    'src_server_ts_entrust-idv-setup_ts': {
                        table: 'sys_module'
                        id: 'd1d1eb1324dd4a2fab833623c2463c88'
                        deleted: true
                    }
                    'src_server_ui-pages_entrust-idv-setup_ts': {
                        table: 'sys_module'
                        id: 'f6005a67a26443699cfc7dc1ae65677a'
                    }
                    'src_server_ui-pages_entrust-idv-setup-client_js': {
                        table: 'sys_module'
                        id: '5abda2adcd8740a2bbc2aa75aa1c99f9'
                    }
                    'src_server_ui-pages_entrust-setup-client_js': {
                        table: 'sys_module'
                        id: '47507078e05b4cab905b0ae4a5fdc7a0'
                        deleted: true
                    }
                    'src_server_ui-pages_EntrustIDVSetupAjax_js': {
                        table: 'sys_module'
                        id: 'f47e1dea7d7a4efd8d9a5ae5ba0ac2e2'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: 'a6208f4747de831016bda144846d43c1'
                        key: {
                            endpoint: 'x_entru_entrustidv_entrust_idv_setup.do'
                        }
                    },
                ]
            }
        }
    }
}

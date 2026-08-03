import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['5603f3dc1b224f145fdb2f05604bcba0'],
    table: 'sys_pd_snapshot_input',
    data: {
        active: 'true',
        array: 'false',
        array_denormalized: 'false',
        attributes: 'element_mapping_provider=com.snc.pd.designer.elementmapping.PlaybookInputElementMapper',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        column_label: 'Parent Record',
        display: 'false',
        dynamic_creation: 'false',
        element: 'parent_record',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'reference',
        label: 'Parent Record',
        mandatory: 'false',
        max_length: '32',
        model: '1603f3dc1b224f145fdb2f05604bcb8a',
        model_id: '1603f3dc1b224f145fdb2f05604bcb8a',
        name: 'var__m_sys_pd_snapshot_input_1603f3dc1b224f145fdb2f05604bcb8a',
        order: '0',
        primary: 'false',
        read_only: 'false',
        reference: 'help_user_interaction',
        reference_floats: 'false',
        spell_check: 'false',
        staged: 'false',
        table_reference: 'false',
        text_index: 'false',
        unique: 'false',
        use_dependent_field: 'false',
        use_dynamic_default: 'false',
        use_reference_qualifier: 'simple',
        virtual: 'false',
        virtual_type: 'script',
        xml_view: 'false',
    },
})

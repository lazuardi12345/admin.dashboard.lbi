export const parseBoolean = (value) => (
  value === true
  || value === 1
  || value === '1'
  || String(value).toLowerCase() === 'true'
  || String(value).toLowerCase() === 'yes'
);

export const createWorkflowEditData = (enrollment) => {
  const metadata = enrollment?.metadata || {};
  const workflow = metadata.admin_workflow || {};

  return {
    test_complete: parseBoolean(workflow.test_complete),
    wna_verified: parseBoolean(workflow.wna_verified),
    relief_requested: parseBoolean(metadata.relief_requested) || parseBoolean(workflow.relief_requested),
    relief_approved: parseBoolean(workflow.relief_approved),
    completion_status: enrollment?.completion_status || '',
    payment_injected_date: workflow.payment_injected_date || '',
    placement_test_result: workflow.placement_test_result || '',
  };
};

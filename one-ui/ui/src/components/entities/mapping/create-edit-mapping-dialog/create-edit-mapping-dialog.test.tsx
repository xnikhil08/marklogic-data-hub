import React from 'react';
import { render, fireEvent, cleanup, waitForElementToBeRemoved } from '@testing-library/react';
import user from '@testing-library/user-event'
import CreateEditMappingDialog from './create-edit-mapping-dialog';
import data from "../../../../config/data.config";
import { NewMapTooltips } from '../../../../config/tooltips.config';

describe('Create/Edit Mapping artifact component', () => {

  afterEach(cleanup)

  test('Verify New Mapping Dialog renders ', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
   
    expect(getByText('New Mapping')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter description')).toBeInTheDocument();
    expect(getByLabelText('Collection')).toBeInTheDocument();
    expect(getByLabelText('Query')).toBeInTheDocument();
    expect(getByPlaceholderText('Please select')).toBeInTheDocument();
    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
    //Collection radio button should be selected by default
    expect(getByLabelText('Collection')).toBeChecked();
  });

  /**
   * @NIKHIL TODO for changing collections since its a not a select list anymore
   * */

  test('Verify mapping name is mandatory and Save button is disabled', () => {
    const { getByText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
    const nameInput = getByPlaceholderText('Enter name');
    const saveButton = getByText('Save');
    
    fireEvent.change(nameInput, { target: {value: 'testCreateMap'}});
    expect(nameInput).toHaveValue('testCreateMap');
    expect(saveButton).toBeEnabled();
    
    fireEvent.change(nameInput, { target: {value: ''}});
    expect(getByText('Name is required')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  })

  /*This test fails for new mapping dialog trying to validate props.mapData.selectedSource 
  @Test -- at Object.<anonymous> (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.test.tsx:62:15)
  @Code -- at onChange (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.tsx:271:48)
  */
  test('Verify able to type in input fields', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<CreateEditMappingDialog {...data.newMap} />);
    
    const descInput = getByPlaceholderText('Enter description');
    const collInput = getByPlaceholderText('Please select');
    const saveButton = getByText('Save');
    saveButton.onclick = jest.fn();
    
    fireEvent.change(descInput, { target: {value: 'test description'}});
    expect(descInput).toHaveValue('test description');
    fireEvent.change(collInput, { target: {value: 'testCollection'}});
    expect(collInput).toHaveValue('testCollection');
    
    fireEvent.click(getByLabelText('Query'));
    const queryInput = getByPlaceholderText('Enter Source Query');
    fireEvent.change(queryInput, { target: {value: 'cts.collectionQuery(["testCollection"])'}});
    expect(queryInput).toHaveTextContent('cts.collectionQuery(["testCollection"])');
    
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalled();

  })

  test('Verify new mapping modal closes when Cancel is clicked', () => {
    const { getByText, debug, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
  
    expect(getByText('New Mapping')).toBeInTheDocument();
    fireEvent.click(getByText('Cancel'));
    //setting newMap to false to close the modal
    rerender(<CreateEditMappingDialog newMap={false}/>);
    //queryByText returns null and getByText throws an error. So we use queryByText to verify element not present scenarios
    expect(queryByText('New Mapping')).not.toBeInTheDocument();
  })

  test('Verify new mapping modal closes when "x" is clicked', () => {
    const { getByLabelText, getByText, debug, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    expect(getByText('New Mapping')).toBeInTheDocument();
    fireEvent.click(getByLabelText('Close'));
    rerender(<CreateEditMappingDialog newMap={false}/>);
    expect(queryByText('New Mapping')).not.toBeInTheDocument();
  })

  /*This test fails for new mapping dialog trying to validate props.mapData.selectedSource
  @Test -- at Object.<anonymous> (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.test.tsx:97:15)
  @Code -- at onChange (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.tsx:271:48)
  */
  test('Verify delete dialog modal when Cancel is clicked', () => {
    const { getByLabelText, getByText, debug, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    fireEvent.click(getByLabelText('Query'));
    fireEvent.click(getByText('Cancel'));
    //setting isSrcQueryTouched to true so checkDeleteOpenEligibility returns true
    //if checkDeleteOpenEligibility is true then setDeleteDialogVisible is also set to true.
    //but stil setting deleteDialogVisible to true to get Discard modal
    rerender(<CreateEditMappingDialog isSrcQueryTouched={true} deleteDialogVisible={true}/>);
    //debug();
    //Not getting Discard modal in the DOM. Needs to be fixed.
    expect(getByText(/^Discard Changes/i)).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  })

  /*This test fails for new mapping dialog trying to validate props.mapData.selectedSource
  @Test -- at Object.<anonymous> (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.test.tsx:113:15)
  @Code -- at onChange (src/components/entities/mapping/create-edit-mapping-dialog/create-edit-mapping-dialog.tsx:271:48)
  */
  test('Verify delete dialog modal when "x" is clicked', () => {
    const { getByLabelText, getByText, debug, rerender, queryByText } = render(<CreateEditMappingDialog {...data.newMap} />);
    fireEvent.click(getByLabelText('Query'));
    fireEvent.click(getByLabelText('Close'));
    rerender(<CreateEditMappingDialog isSrcQueryTouched={true} deleteDialogVisible={true}/>);
    //Not getting Discard modal in the DOM. Needs to be fixed.
    expect(getByText(/^Discard Changes/i)).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
    expect(getByText('No')).toBeInTheDocument();
  })

  test('Verify Edit Mapping dialog renders correctly', () => {
    const { debug, getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} />);
    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');

    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByPlaceholderText('Please select')).toHaveValue('map-collection');

    fireEvent.click(getByLabelText('Query'));
    expect(getByPlaceholderText('Enter Source Query')).toHaveTextContent("cts.collectionQuery(['map-collection'])");

    expect(getByText('Save')).toBeEnabled();
    expect(getByText('Cancel')).toBeEnabled();
  })

  test('Verify Edit Mapping dialog renders correctly for a read only user', () => {
    const { getByText, getByPlaceholderText, getByLabelText } = render(<CreateEditMappingDialog {...data.editMap} canReadOnly={true} canReadWrite={false}/>);
  
    expect(getByPlaceholderText('Enter name')).toHaveValue('testMap');
    expect(getByPlaceholderText('Enter name')).toBeDisabled();
    expect(getByPlaceholderText('Enter description')).toHaveValue('Description of testMap');
    expect(getByPlaceholderText('Enter description')).toBeDisabled();
    expect(getByLabelText('Collection')).toBeChecked();
    expect(getByLabelText('Collection')).toBeDisabled();
    expect(getByLabelText('Query')).toBeDisabled();
    expect(getByPlaceholderText('Please select')).toBeDisabled();

    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
    expect(getByLabelText('Close')).toBeEnabled();
  })


});

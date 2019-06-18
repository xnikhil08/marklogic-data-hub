import {Component, EventEmitter, Input, OnInit, Output, OnChanges} from "@angular/core";
import { FlowsTooltips } from '../../../tooltips/flows.tooltips';
import {ClipboardDirective} from '../../../../../directives/clipboard/clipboard.directive';
import { EntitiesService } from '../../../../../models/entities.service';
import { Flow } from '../../../models/flow.model';
import * as _ from 'lodash';
import { EnvironmentService } from '../../../../../services/environment';
import { Step } from '../../../models/step.model';
import { flow } from 'lodash';


const settings = {
  inputFilePath: {
    label: 'Source Directory Path',
    description: 'Fhe filesystem location(s) to use for input. Default is current project path relative to the server location',
    value: '.'
  },
  fileTypes: {
    label: 'Source Format',
    description: 'The input file type. Accepted value: txt, json, xml, binary, csv, or all.\nDefault: json.',
    options: [
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'JSON',
        value: 'json',
      },
      {
        label: 'XML',
        value: 'xml',
      },
      {
        label: 'Binary',
        value: 'binary',
      },
      {
        label: 'CSV',
        value: 'csv',
      }
    ]
  },
  SourceFormatDelimiter: {
    label: 'Source Format Delimiter',
    description: 'The delimiter character used in the delimited file. Accepted values are comma(,), tab(" "). Default: (,)',
    value: ','
  },
  outputDocTypes: {
    label: 'Target Format',
    description: 'The type of document to create. Accepted values: xml, json. Default: json.',
    options: [
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'JSON',
        value: 'json',
      },
      {
        label: 'XML',
        value: 'xml',
      },
      {
        label: 'Binary',
        value: 'binary',
      }
    ]
  },
  outputPermissions: {
    label: 'Target Permissions',
    description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: role1,read,role2,update',
    value: 'rest-reader,read,rest-writer,update',
  },
  outputURIReplacement: {
    label: 'Target URI Replacement',
    description: 'Specify a prefix to prepend to the default URI. Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.'
  }
};

interface MlcpOptions {
  [key: string]: any;
}

@Component({
  selector: 'app-ingest-ui',
  templateUrl: './ingest-ui.component.html',
  styleUrls: ['./ingest-ui.component.scss']
})
export class IngestUiComponent implements OnInit{

  @Input() step: Step;
  @Input() flow: Flow;
  @Output() saveStep = new EventEmitter();
  @Output() clipboardSuccess = new EventEmitter();
  tooltips: any;
  groups: Array<any>;
  mlcp = <MlcpOptions>{};

  
  mlcpOptions = {
    "input_file_path": "",
    "input_file_type": "json",
    "output_collections": "",
    "output_permissions": "",
    "document_type": "",
    "transform_module": "/data-hub/5/transforms/mlcp-flow-transform.sjs",
    "transform_namespace": "http://marklogic.com/data-hub/mlcp-flow-transform",
    "transform_param": "",
  }

 
  inputFilePath: string;
  startPath: string;
  //mlcpcommand = 'mlcp.sh import -mode "local" -host "localhost" -port "8010" -username "nikhils" -password "*****" -input_file_path "/Users/nshrivas/Documents/SampleData/JSONData" -input_file_type "documents" -output_collections "Provider_New,Ingest_Provider_New_Data_mlcp" -output_permissions "rest-reader,read,rest-writer,update" -document_type "json" -transform_module "/data-hub/5/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Providers_New,flow-name=ProvidersNew"';
  @Output() finishedEvent: EventEmitter<boolean>;
  _isVisible: boolean;
  mlcpCommand: string;
  

  constructor(
    private entitiesService: EntitiesService,
    private envService: EnvironmentService
  ) {
  }

  ngOnInit(): void {
    this.tooltips = FlowsTooltips.ingest;
    this.updateMlcpCommand();
  }

  

  config = settings;
  changeFolder(folder) {
    if (this.step.fileLocations.inputFilePath !== folder.absolutePath) {
      this.step.fileLocations.inputFilePath = folder.absolutePath;
      this.onChange();
      
 // Update Input File Path
      const generalGroup = _.find(this.groups, (group: any) => {
      return group.category === 'Default Input Options';
      });
     const inputFilePath = _.find(generalGroup.settings, (setting: any) => {
      return setting.field === 'input_file_path';
      });
    inputFilePath.value = folder.absolutePath;
    //  this.inputFilePath = inputFilePath.value;
    // update the outputUriReplace options
      const outputUriReplace = _.find(generalGroup.settings, (setting: any) => {
      return setting.field === 'output_uri_replace';
      });
      outputUriReplace.value = this.outputUriReplaceValue();

      this.updateMlcpCommand();
      return 
    }
     

  }

  onKeyChange(event) {
    if (event.key === 'Enter') {
      this.onChange();
    }
  }
/*
  ngOnChanges(changes: any) {
    if (changes.mlcpOptions && changes.mlcpOptions.currentValue) {
      this.show(changes.mlcpOptions.currentValue, this.flow);
    }
  }

  

//Creating mlcp command

  show(mlcpOptions: any, flow: Flow): EventEmitter<boolean> {
    this.finishedEvent = new EventEmitter<boolean>(true);

    this.flow = flow;

    
    //mlcpOptions['transform_module'] = this.flow.transformModulePath();

    this.inputFilePath = this.startPath = mlcpOptions.input_file_path || '.';
    //this.groups = this.getGroups(flow.entityName, flow.flowName, flow.dataFormat, mlcpOptions);

    this.updateMlcpCommand();

    this._isVisible = true;
    return this.finishedEvent;
  }
*/
  /* tslint:disable:max-line-length */
  getGroups(flowName: string, dataFormat: string, previousOptions: any) {
    const groups = [
      { category: "Default Input Options",
        settings: [
          {
            label: 'Source Directory Path',
            field: 'input_file_path',
            type: 'string',
            description: 'A regular expression describing the filesystem location(s) to use for input.',
            value: `${this.inputFilePath}`
          },
          {
            label: 'Source Format',
            field: 'input_file_type',
            type: 'type',
            description: 'The input file type. Accepted value: aggregates, archive, delimited_text, delimited_json, documents, forest, rdf, sequencefile.\nDefault: documents.',
            options: [
              {
                label: 'Text',
                value: 'documents',
              },
              {
                label: 'JSON',
                value: 'documents',
              },
              {
                label: 'XML',
                value: 'documents',
              },
              {
                label: 'Binary',
                value: 'documents',
              },
              {
                label: 'CSV',
                value: 'delimited_text',
              },
            ],
            value: 'documents'
          },
          {
            field: 'output_collections',
            type: 'comma-list',
            description: 'A comma separated list of collection URIs. Loaded documents are added to these collections.',
            value: flowName.replace(new RegExp(' ', 'g'), '') + ',input',
          },
          {
            label: 'Target Permissions',
            field: 'output_permissions',
            type: 'comma-list',
            description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
            value: 'rest-reader,read,rest-writer,update',
          },
          {
            label: 'Target URI Replacement',
            field: 'output_uri_replace',
            type: 'string',
            description: 'A comma separated list of (regex,string) pairs that define string replacements to apply to the URIs of documents added to the database. The replacement strings must be enclosed in single quotes. For example, -output_uri_replace "regex1,\'string1\',regext2,\'string2\'"'
          },
          {
            label: 'Target Format',
            field: 'document_type',
            type: 'type',
            description: 'The type of document to create when -input_file_type is documents. Accepted values: xml, json, text, binary. Default: JSON for documents, xml for sequencefile, and xml for delimited_text.',
            options: [
              {
                label: 'xml',
                value: 'xml',
              },
              {
                label: 'json',
                value: 'json',
              },
              {
                label: 'text',
                value: 'text',
              },
              {
                label: 'binary',
                value: 'binary',
              },
            ],
            value: dataFormat.toLowerCase(),
          }
        ],
        collapsed: true,
      },
      {
        category: 'Transform Options',
        settings: [
          {
            field: 'transform_module',
            type: 'string',
            description: 'The path in the modules database or modules directory of a custom content transformation function installed on MarkLogic Server. This option is required to enable a custom transformation. For details, see Transforming Content During Ingestion.',
            value: '/data-hub/5/transforms/mlcp-flow-transform.sjs',
            readOnly: true,
          },
          {
            field: 'transform_namespace',
            type: 'string',
            description: 'The namespace URI of the custom content transformation function named by -transform_function. Ignored if-transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
            value: 'http://marklogic.com/data-hub/mlcp-flow-transform',
            readOnly: true,
          },
          {
            field: 'transform_param',
            type: 'string',
            description: 'Optional extra data to pass through to a custom transformation function. Ignored if -transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
            value: `flow-name=${encodeURIComponent(flowName)}`,
            readOnly: true,
          },
        ],
        collapsed: true,
      }
    ];
    _.each(previousOptions, (value, key) => {
      _.each(groups, (group) => {
        _.each(group.settings, (setting: any) => {
          if (setting.field === key) {
            setting.value = (value && value.replace) ? value.replace(/"/g, '') : value;
          }
        });
      });
    });
    return groups;
  }

  buildMlcpOptions(): Array<any> {
    const options: Array<any> = [];

    this.mlcp = {};
    this.addMlcpOption(options, 'import', null, false, false);
    this.addMlcpOption(options, 'mode', 'local', false, true);

    const host = this.envService.settings.host;
    const port = this.envService.settings.stagingPort;
    const username = this.envService.settings.mlUsername;
    let input_file_path = this.step.fileLocations.inputFilePath;
    let transform_param = `flow-name=${encodeURIComponent(this.flow.name)}`
    let collections = this.flow.name.replace(new RegExp(' ', 'g'), '') + ',input,SampleProv'
    this.addMlcpOption(options, 'host', host, false, true);
    this.addMlcpOption(options, 'port', port, false, true);
    this.addMlcpOption(options, 'username', username, false, true);
    this.addMlcpOption(options, 'password', '*****', false, true);
    this.addMlcpOption(options, 'input_file_path', input_file_path, false, true);
    this.addMlcpOption(options, 'transform_namespace', 'http://marklogic.com/data-hub/mlcp-flow-transform', false, true);
    this.addMlcpOption(options, 'transform_module', '/data-hub/5/transforms/mlcp-flow-transform.sjs', false, true);
    this.addMlcpOption(options, 'transform_param', transform_param, false, true);
    this.addMlcpOption(options, 'output_collections', collections, false, true);
    

    
    //
    //  let filePath = this.step.fileLocations.inputFilePath;
    _.each(this.groups, (group) => {
        _.each(group.settings, (setting: any) => {
          if (setting.value) {
            const key = setting.field;
            const value = setting.value;
            this.addMlcpOption(options, key, value, true, true);
          }
        });
    });
    return options;
  }
  isGroupVisible(category: any) {
    throw new Error("Method not implemented.");
  }

  addMlcpOption(options: any, key: string, value: any, isOtherOption: boolean, appendDash: boolean): void {
    if (appendDash) {
      options.push('-' + key);
    } else {
      options.push(key);
    }

    if (value) {
      if (isOtherOption) {
        this.mlcp[key] = value;
      }
      if (value.type !== 'boolean' && value.type !== 'number') {
        value = '"' + value + '"';
      }
      options.push(value);
    }
  }

  updateMlcpCommand(): string {
    
    let mlcpCommand = 'mlcp';
    mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';
    mlcpCommand += ' ' + this.buildMlcpOptions().join(' ');

    this.mlcpCommand = mlcpCommand;

    return mlcpCommand;
  }

  outputUriReplaceValue() {
    return `${this.inputFilePath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')},''`;
  }

  onChange() {
    this.saveStep.emit(this.step);
  }

    // Testing 
  //mlcmd = this.updateMlcpCommand();

/*
  runMlcp(flow: Flow, step: Step){
    this.inputFilePath = step.fileLocations.inputFilePath;
    //this.groups = this.getGroups(flow.entityName, flow.flowName, flow.dataFormat, this.mlcpOptions);
    
    this.updateMlcpCommand();

    //this._isVisible = true;
    return this.mlcpCommand;
  }
  //this.inputFilePath = this.startPath = mlcpOptions.input_file_path || '.';
 */ 
  
}

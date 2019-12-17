import { ResultsParams, ResultsResponse } from '../../insights/definitions'
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ConnectionData } from '../connections/connections.class'
import getStructure from '../../insights/structure'
import createAdapter from '../../insights/adapter'
import FindResults from '../../insights/results'

interface ServiceOptions {}
interface ResultsServiceParams extends Params {
  query: ResultsParams
}

export class Results implements Partial<ServiceMethods<ResultsResponse>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (params: ResultsServiceParams): Promise<ResultsResponse> {
    return await this.find(params)
  }

  async find (params: ResultsServiceParams): Promise<ResultsResponse> {
    const { connection } = params.query
    const connectionsResult = await this.app.service('connections').find({ query: { keyword: connection } })

    const { structurePath, url } = (connectionsResult as Paginated<ConnectionData>).data[0]

    const structure = await getStructure(structurePath, url)
    const adapter = createAdapter(url)

    const results = new FindResults({ params: params.query, adapter, structure })
    return results.getResponse()
  }
}

// Initializes the `resources` service on path `/resources`
const createService = require('feathers-mongoose');
const createModel = require('../../models/resources.model');
const hooks = require('./resources.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  class Handlers {
    constructor() {
      this.general = {
        /**
         * GET
         * @param {*} params
         * returns an ARRAY of the sections
         */
        async find(params) {
          try {
            const result = await Model.find({});
            return result;
          } catch (err) {
            return err;
          }
        },

        /**
         * CREATE
         * @param {*} data
         * @param {*} params
         * send in a json object of data and get back the submitted object
         */
        async create(data, params) {
          try {
            // add in the user to the submittedBy property
            // add in the creator to the collaborators array
            data = Object.assign({
              submittedBy: params.user._id,
              collaborators: [params.user._id],
            }, data)
            const result = await Model.create(data);
            return result;
          } catch (err) {
            return err;
          }
        }


      };

      this.byId = {
        /**
         * FIND
         * @param {*} params
         * finds the data by id and returns it
         */
        async find(params) {
          try {
            const {
              id
            } = params.route;
            // const result = await Model.findOne({
            //   _id: id
            // }).populate({ path: 'submittedBy', select: 'username' }).exec();
            const result = await Model.findOne({
              _id: id
            }).populate({
              path: 'submittedBy'
            }).exec();

            return result;
          } catch (err) {
            return err;
          }
        },
        /**
         * PATCH
         * @param {*} _id
         * @param {*} data
         * @param {*} params
         * finds the data by id and returns the updated data
         * * * [
         *     {"op":"set", "path":"title", "value":"Learning with Dan is my Favorite Thing"}, 
         *     {"op":"set", "path":"description",  "value":"don't you want to learn with Dan?"}, 
         *     {"op":"push", "path":"sections", "value":"5bd366ac399838e5d063aa2c"}
         * ]
         */
        async patch(_id, data, params) {
          try {
            const {
              id
            } = params.route;
            let updateProps = {
              "$set": {},
              "$push": {},
              "$pull": {}
            }


            data.forEach( item => {
              if(item.op === "set"){
                updateProps["$set"] = Object.assign({[item.path]: item.value },  updateProps["$set"]);
              } else if (item.op === "push"){
                updateProps["$push"] = Object.assign({[item.path]: item.value },  updateProps["$push"]);
              } else if (item.op === "pull"){
                updateProps["$pull"] = Object.assign({[item.path]: item.value },  updateProps["$pull"]);
              }
            });

            Object.keys(updateProps).forEach( (key) => {
              if( Object.keys(updateProps[key]).length < 1 ){
                delete updateProps[key]
              }
            });
          
            const result = await Model.findOneAndUpdate(
                {_id:id}, updateProps, {
                  new: true
                }
              )
              .populate('collaborators')
              .populate('submittedBy')
              .exec();

            return result;
          } catch (err) {
            return err;
          }
        },

        /**
         * REMOVE
         * @param {*} _id
         * @param {*} params
         * finds the data by id and returns 'resource removed' when it has been removed
         */
        async remove(_id, params) {
          try {
            const {
              id
            } = params.route;
            const result = await Model.deleteOne({
              _id: id
            });
            console.log(id, result);

            return {
              message: 'resource removed!'
            };
          } catch (err) {
            return err;
          }
        }
      };


      this.addJSON = {
        // TODO
      }

    }

  }
  const handlers = new Handlers();

  // our routes
  // app.use('/resources', handlers.general);
  // app.use('/resources/id/:id', handlers.byId);
  // add in our service hooks
  // app.service('/resources').hooks(hooks);
  // app.service('/resources/id/:id').hooks(hooks);

  // Initialize our service with any options it requires
  app.use('/resources', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('resources');

  service.hooks(hooks);
};

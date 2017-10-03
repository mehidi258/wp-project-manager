 import Vue from './vue/vue';

 export default Vue.mixin({

 	data () {
 		return {
 			base_url: PM_Vars.base_url +'/'+ PM_Vars.rest_api_prefix,
 			project_id: typeof this.$route === 'undefined'? false : this.$route.params.project_id,
 		}
 	},

	methods: {
		httpRequest (property) {
			var before = function( xhr ) {
			    xhr.setRequestHeader("Authorization_name", btoa('asaquzzaman')); //btoa js encoding base64_encode
			    xhr.setRequestHeader("Authorization_password", btoa(12345678)); //atob js decode base64_decode
			};

			property.beforeSend = typeof property.beforeSend === 'undefined' ? before : property.beforeSend;

			jQuery.ajax(property);
		},

        newProject () {
            var self = this;

            if (this.is_update) {
                var type = 'PUT';
                var url = this.base_url + '/cpm/v2/projects/'+ this.project.id;
            } else {
                var type = 'POST';
                var url = this.base_url + '/cpm/v2/projects/';
            }

            var request = {
                type: type,

                url: url,

                data: {
                    'title': this.project.title,
                    'categories': [this.project_cat],
                    'description': this.project.description,
                    'notify_users': this.project_notify,
                    'assignees': this.formatUsers(this.project_users)
                },

                success: function(res) {
                    self.$root.$store.commit('newProject', res.data);
                    self.showHideProjectForm(false);
                    jQuery( "#cpm-project-dialog" ).dialog("close");
                },

                error: function(res) {
                    
                }
            };
    
            this.httpRequest(request);
        },

        getProjects () {
            var self = this;
            self.httpRequest({
                url: self.base_url + '/cpm/v2/projects?per_page=2&page='+ self.setCurrentPageNumber(self),
                success: function(res) {
                    res.data.map(function(project) {
                        self.addProjectMeta(project);
                    });
                    self.$root.$store.commit('setProjects', {'projects': res.data});
                    self.$root.$store.commit('setProjectMeta', res.meta );
                }
            });
        },

        setCurrentPageNumber (self) {
            var current_page_number = self.$route.params.current_page_number ? self.$route.params.current_page_number : 1;
            self.current_page_number = current_page_number;
            return current_page_number;
        },

		getProject (project_id, callback) {
			var self = this;
            
            var callback   = callback || false;
			var project_id = project_id || self.project_id;

			if ( typeof self.project_id === 'undefined' ) {
				return;
			}

            var project = self.$root.$store.state.project;

            if ( !jQuery.isEmptyObject(project) ) {
                if (project.id === self.project_id) {
                    if (callback) {
                        callback(project);
                    }
                    return project;
                }
            }
            
            self.httpRequest({
                url: self.base_url + '/cpm/v2/projects/'+ self.project_id,
                success: function(res) {
                    self.addProjectMeta(res.data);
                    self.$root.$store.commit('setProject', res.data);
                    self.$root.$store.commit('setProjectUsers', res.data.assignees.data);

                    if (callback) {
                        callback(res.data);
                    }
                }
            });
        },

        addProjectMeta (project) {
            project.edit_mode = false;
            project.settings_hide = false;
        },

        getProjectCategories (callback) {
            var callback = callback || false;
            var self = this;

            var categories = self.$root.$store.state.categories;

            if ( categories.length ) {
                if (callback) {
                    callback(categories);
                }
                return categories;
            }

            this.httpRequest({
                url: self.base_url + '/cpm/v2/categories?type=project',
                success: function(res) {
                    self.$root.$store.commit('setCategories', res.data);

                    if (callback) {
                        callback(res.data);
                    }
                }
            });
        },

        getRoles (callback) {
            var callback = callback || false;
            var self = this;

            var roles = self.$root.$store.state.roles;

            if ( roles.length ) {
                if (callback) {
                    callback(roles);
                }
                return roles;
            }

            self.httpRequest({
                url: self.base_url + '/cpm/v2/roles',
                success: function(res) {
                    self.$root.$store.commit('setRoles', res.data);

                    if (callback) {
                        callback(res.data);
                    }
                }
            });
        },
        /**
         * Get index from array object element
         *
         * @param   itemList
         * @param   id
         *
         * @return  int
         */
        getIndex: function ( itemList, id, slug) {
            var index = false;

            itemList.forEach(function(item, key) {
                if (item[slug] == id) {
                    index = key;
                }
            });

            return index;
        },

        showHideProjectForm (status) {
            this.$root.$store.commit('showHideProjectForm', status);
        }
	}
});

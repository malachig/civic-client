(function() {
  'use strict';
  angular.module('civic.events.genes')
    .config(GenesViewConfig)
    .controller('GenesViewController', GenesViewController);

  // @ngInject
  function GenesViewConfig($stateProvider) {
    $stateProvider
      .state('events.genes', {
        abstract: true,
        url: '/genes/:geneId',
        templateUrl: 'app/views/events/genes/GenesView.tpl.html',
        resolve: /* @ngInject */ {
          Genes: 'Genes',
          MyGeneInfo: 'MyGeneInfo',
          gene: function(Genes, $stateParams) {
            return Genes.get($stateParams.geneId);
          },
          myGeneInfo: function(MyGeneInfo, gene) {
            return MyGeneInfo.get(gene.entrez_id);
          },
          variants: function(Genes, gene) {
            return Genes.getVariants(gene.entrez_id);
          },
          variantGroups: function(Genes, gene) {
            return Genes.getVariantGroups(gene.entrez_id)
          }
        },
        controller: 'GenesViewController',
        deepStateRedirect: [ 'geneId' ],
        onExit: /* @ngInject */ function($deepStateRedirect) {
          $deepStateRedirect.reset();
        }
      })
      .state('events.genes.summary', {
        url: '/summary',
        template: '<gene-summary></gene-summary>',
        deepStateRedirect: true,
        sticky: true,
        data: {
          titleExp: '"Gene " + gene.entrez_name + " Summary"',
          navMode: 'sub'
        }
      })
      .state('events.genes.edit', {
        url: '/edit',
        template: '<edit-gene></edit-gene>',
        data: {
          titleExp: '"Gene " + gene.entrez_name + " Edit"',
          navMode: 'sub'
        }
      });
  }

  // @ngInject
  function GenesViewController($scope,
                               $state,
                               // resolved services
                               Genes,
                               MyGeneInfo,
                               // resolved resources
                               gene,
                               variants,
                               variantGroups,
                               myGeneInfo) {

    var ctrl = $scope.ctrl = {};
    var geneModel = ctrl.geneModel = {};

    geneModel.config = {
      type: 'gene',
      name: gene.entrez_name,
      state: {
        baseState: 'events.genes',
        baseUrl: $state.href('events.genes', { geneId: gene.entrez_id }),
        params: { geneId: gene.entrez_id }
      },
      tabData: [
        {
          heading: 'Gene Summary',
          route: 'events.genes.summary',
          params: { geneId: gene.entrez_id }
        },
        {
          heading: 'Gene Talk',
          route: 'events.genes.talk.log',
          params: { geneId: gene.entrez_id }
        }
      ],
      styles: {
        view: {
          backgroundColor: 'pageBackground2'
        },
        summary: {
          backgroundColor: 'pageBackground2'
        },
        myGeneInfo: {
          backgroundColor: 'pageBackground2'
        },
        variantMenu: {
          backgroundColor: 'pageBackground2'
        },
        edit: {
          summaryBackgroundColor: 'pageBackground2'
        }
      }
    };

    geneModel.data = {
      entity: gene,
      id: gene.entrez_id,
      parent: null,
      parentId: null,
      comments: [],
      changes: [],
      revisions: [],
      variants: variants,
      variantGroups: variantGroups,
      myGeneInfo: myGeneInfo
    };

    geneModel.services = {
      Genes: Genes,
      MyGeneInfo: MyGeneInfo
    };

    geneModel.actions = {
      get: function() {
        return gene;
      },

      update: function(reqObj) {
        reqObj.geneId = gene.entrez_id;
        Genes.update(reqObj);
        this.refresh();
      },

      refresh: function () {
        Genes.refresh(gene.entrez_id)
          .then(function(response) {
            gene = response;
            return response;
          })
      },
      submitChange: function(reqObj) {
        reqObj.geneId = gene.entrez_id;
        return Genes.submitChange(reqObj)
          .then(function(response) {
            return response;
          });
      },
      acceptChange: function(changeId) {
        return Genes.acceptChange({ geneId: gene.entrez_id, changeId: changeId })
          .then(function(response) {
            return response;
          })
      }
    };
  }

})();

(function ($) {
  $.fn.mauGallery = function (options) {
      const settings = $.extend($.fn.mauGallery.defaults, options);
      const tagsCollection = [];

      return this.each(function () {
          const $gallery = $(this);
          createRowWrapper($gallery);

          if (settings.lightBox) {
              createLightBox($gallery, settings.lightboxId, settings.navigation);
          }

          $gallery.children(".gallery-item").each(function () {
              const $item = $(this);
              makeResponsiveImage($item);
              moveItemToRow($item);
              wrapItemInColumn($item, settings.columns);
              addTag($item.data("gallery-tag"));
          });

          if (settings.showTags) {
              showTags($gallery, settings.tagsPosition, tagsCollection);
          }

          attachListeners($gallery, settings);
          $gallery.fadeIn(500);
      });

      // Functions and Methods
      function addTag(tag) {
          if (settings.showTags && tag !== undefined && tagsCollection.indexOf(tag) === -1) {
              tagsCollection.push(tag);
          }
      }

      function createRowWrapper(element) {
          if (!element.children().first().hasClass("row")) {
              element.append('<div class="gallery-items-row row"></div>');
          }
      }

      function wrapItemInColumn(element, columns) {
          const columnClasses = buildColumnClasses(columns);
          if (columnClasses) {
              element.wrap(`<div class='item-column mb-4 ${columnClasses}'></div>`);
          } else {
              console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
          }
      }

      function buildColumnClasses(columns) {
          if (typeof columns === "number") {
              return `col-${Math.ceil(12 / columns)}`;
          } else if (typeof columns === "object") {
              let classes = '';
              if (columns.xs) classes += ` col-${Math.ceil(12 / columns.xs)}`;
              if (columns.sm) classes += ` col-sm-${Math.ceil(12 / columns.sm)}`;
              if (columns.md) classes += ` col-md-${Math.ceil(12 / columns.md)}`;
              if (columns.lg) classes += ` col-lg-${Math.ceil(12 / columns.lg)}`;
              if (columns.xl) classes += ` col-xl-${Math.ceil(12 / columns.xl)}`;
              return classes.trim();
          }
          return null;
      }

      function moveItemToRow(element) {
          element.appendTo(".gallery-items-row");
      }

      function makeResponsiveImage(element) {
          if (element.prop("tagName") === "IMG") {
              element.addClass("img-fluid");
          }
      }

      function createLightBox(gallery, lightboxId, navigation) {
          gallery.append(`<div class="modal fade" id="${
              lightboxId ? lightboxId : "galleryLightbox"
          }" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-body">
                          ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
                          <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                          ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : ''}
                      </div>
                  </div>
              </div>
          </div>`);
      }

      function attachListeners(gallery, options) {
          gallery.on("click", ".gallery-item", function () {
              if (options.lightBox && $(this).prop("tagName") === "IMG") {
                  openLightBox($(this), options.lightboxId);
              }
          });

          gallery.on("click", ".nav-link", filterByTag);
          gallery.on("click", ".mg-prev", () => navigateImage(options.lightboxId, 'prev'));
          gallery.on("click", ".mg-next", () => navigateImage(options.lightboxId, 'next'));
      }

      function openLightBox(element, lightboxId) {
          $(`#${lightboxId}`)
              .find(".lightboxImage")
              .attr("src", element.attr("src"));
          $(`#${lightboxId}`).modal("toggle");
      }

      function showTags(gallery, position, tags) {
          let tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
          $.each(tags, function (index, value) {
              tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
          });
          const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

          if (position === "bottom") {
              gallery.append(tagsRow);
          } else if (position === "top") {
              gallery.prepend(tagsRow);
          } else {
              console.error(`Unknown tags position: ${position}`);
          }
      }

      function filterByTag() {
          if ($(this).hasClass("active-tag")) {
              return;
          }
          $(".active-tag").removeClass("active active-tag");
          $(this).addClass("active-tag");

          const tag = $(this).data("images-toggle");
          $(".gallery-item").each(function () {
              const $itemColumn = $(this).parents(".item-column");
              if (tag === "all" || $(this).data("gallery-tag") === tag) {
                  $itemColumn.show(300);
              } else {
                  $itemColumn.hide();
              }
          });
      }

      function navigateImage(lightboxId, direction) {
          const $lightboxImage = $(`#${lightboxId}`).find(".lightboxImage");
          const currentSrc = $lightboxImage.attr("src");
          const activeTag = $(".tags-bar span.active-tag").data("images-toggle");

          let imagesCollection = [];
          $(".item-column").each(function () {
              const $img = $(this).children("img");
              if (activeTag === "all" || $img.data("gallery-tag") === activeTag) {
                  imagesCollection.push($img);
              }
          });

          const currentIndex = imagesCollection.findIndex(img => img.attr("src") === currentSrc);
          let nextIndex = (direction === 'prev') ? currentIndex - 1 : currentIndex + 1;

          if (nextIndex < 0) nextIndex = imagesCollection.length - 1;
          if (nextIndex >= imagesCollection.length) nextIndex = 0;

          $lightboxImage.attr("src", imagesCollection[nextIndex].attr("src"));
      }
  };

  // Default options
  $.fn.mauGallery.defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
  };
})(jQuery);
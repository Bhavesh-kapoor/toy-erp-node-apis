class BaseRouter {
  constructor(router, controller) {
    this.controller = controller;
    this.router = router;
  }

  use() {
    const controller = this.controller;
    const router = this.router;

    router
      .route("/:id?")
      .get(controller.get)
      .post(controller.create)
      .put(controller.update)
      .delete(controller.delete);
  }
}

export default BaseRouter;

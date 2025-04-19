import { setSeederFactory } from 'typeorm-extension';
import {
  PaymentStatus,
  SubscriptionDetail,
  SubscriptionType,
} from '../../subscription-details/entities/subscription-detail.entity';

export default setSeederFactory(SubscriptionDetail, (faker) => {
  const subscriptionDetail = new SubscriptionDetail();

  const subscriptionType = faker.helpers.arrayElement(
    Object.values(SubscriptionType),
  );

  const paymentStatusObj = {
    [SubscriptionType.PREMIUM]: [PaymentStatus.PAID, PaymentStatus.PENDING],
    [SubscriptionType.FREE]: [
      PaymentStatus.CANCELED,
      PaymentStatus.FAILED,
      null,
    ],
  };

  subscriptionDetail.type = subscriptionType;

  if (subscriptionType === SubscriptionType.PREMIUM) {
    subscriptionDetail.startDate = faker.date.past();
    subscriptionDetail.endDate = faker.date.future();
  } else {
    subscriptionDetail.startDate = null;
    subscriptionDetail.endDate = null;
  }

  subscriptionDetail.paymentStatus = faker.helpers.arrayElement(
    paymentStatusObj[subscriptionType],
  );

  return subscriptionDetail;
});

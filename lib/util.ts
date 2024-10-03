// type FilterCriteria<T> = Partial<T>;

// type MatchingMessage<T, F extends FilterCriteria<T>> = T extends {
//   [K in keyof F]: F[K];
// }
//   ? T
//   : never;

// export function onMatch<T, F extends FilterCriteria<T>>(
//   filter: F,
//   callback: (message: MatchingMessage<T, F>) => void
// ): (message: unknown) => void {
//   return (message: unknown) => {
//     if (typeof message === "object" && message !== null) {
//       const typedMessage = message as T;
//       const isMatch = Object.entries(filter).every(
//         ([key, value]) => typedMessage[key as keyof T] === value
//       );

//       if (isMatch) callback(typedMessage as MatchingMessage<T, F>);
//     }
//   };
// }
